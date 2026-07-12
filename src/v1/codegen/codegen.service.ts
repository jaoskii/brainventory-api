import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateCodeDto } from './dto/generate-code.dto';
import {
  CODEGEN_MODULES,
  CodegenConfig,
  CodegenModule,
  CodegenTrigger,
  GeneratedCode,
} from './codegen.types';

@Injectable()
export class CodegenService implements OnModuleInit {
  private config!: CodegenConfig;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.config = this.loadConfig();
  }

  getConfig(): CodegenConfig {
    return this.config;
  }

  getModuleConfig(module: string) {
    this.assertModule(module);
    return {
      codegenLength: this.config.codegenLength,
      defaultUom: this.config.defaultUom,
      priceGroups: this.config.priceGroups,
      prefixes: this.getPrefixes(module),
    };
  }

  async generate(dto: GenerateCodeDto): Promise<GeneratedCode> {
    this.assertModule(dto.module);

    switch (dto.trigger) {
      case 'prefix_enter':
        return this.generateFromPrefixEnter(dto.module, dto.input);
      case 'new':
        return this.generateFromNew(dto.module, dto.input);
      case 'pattern':
        return this.generateFromPattern(dto.module, dto.input);
      default:
        throw new BadRequestException(`Invalid trigger: ${dto.trigger as string}`);
    }
  }

  private async generateFromPrefixEnter(
    module: CodegenModule,
    input?: string,
  ): Promise<GeneratedCode> {
    const prefix = (input ?? '').trim().toUpperCase();
    if (!prefix) {
      throw new BadRequestException('Prefix input is required');
    }

    this.assertKnownPrefix(module, prefix);
    const lastSeries = await this.getLastSeries(module, prefix);
    const series = lastSeries + 1;

    return this.buildResult(module, prefix, series);
  }

  private async generateFromNew(
    module: CodegenModule,
    input?: string,
  ): Promise<GeneratedCode> {
    const currentCode = (input ?? '').trim().toUpperCase();
    const prefixes = this.getPrefixes(module);
    if (!prefixes.length) {
      throw new BadRequestException(`No prefixes configured for module ${module}`);
    }

    let prefix = prefixes[0].toUpperCase();

    if (currentCode) {
      try {
        const parsed = this.parseCode(module, currentCode);
        prefix = parsed.prefix;
        const lastSeries = await this.getLastSeries(module, prefix);
        const series = Math.max(parsed.series, lastSeries) + 1;
        return this.buildResult(module, prefix, series);
      } catch {
        // Current barcode does not match a configured prefix — use first prefix.
      }
    }

    const lastSeries = await this.getLastSeries(module, prefix);
    const series = lastSeries + 1;
    return this.buildResult(module, prefix, series);
  }

  private generateFromPattern(
    module: CodegenModule,
    input?: string,
  ): Promise<GeneratedCode> {
    const pattern = (input ?? '').trim().toUpperCase();
    if (!pattern) {
      throw new BadRequestException('Pattern input is required');
    }

    const parsed = this.parsePattern(module, pattern);
    return Promise.resolve(this.buildResult(module, parsed.prefix, parsed.series));
  }

  private buildResult(
    module: CodegenModule,
    prefix: string,
    series: number,
  ): GeneratedCode {
    this.assertKnownPrefix(module, prefix);
    const code = this.formatCode(prefix, series, this.config.codegenLength);

    return {
      code,
      prefix,
      series,
      module,
      codegenLength: this.config.codegenLength,
    };
  }

  formatCode(prefix: string, series: number, codegenLength: number): string {
    const normalizedPrefix = prefix.toUpperCase();
    const seriesLength = codegenLength - normalizedPrefix.length;

    if (seriesLength <= 0) {
      throw new BadRequestException(
        `Prefix "${normalizedPrefix}" exceeds codegen length ${codegenLength}`,
      );
    }

    if (!Number.isInteger(series) || series < 0) {
      throw new BadRequestException('Series must be a non-negative integer');
    }

    const seriesStr = String(series);
    if (seriesStr.length > seriesLength) {
      throw new BadRequestException(
        `Series ${series} exceeds available digits (${seriesLength}) for prefix "${normalizedPrefix}"`,
      );
    }

    return normalizedPrefix + seriesStr.padStart(seriesLength, '0');
  }

  private parsePattern(module: CodegenModule, pattern: string): {
    prefix: string;
    series: number;
  } {
    const parsed = this.matchPrefix(module, pattern);
    const remainder = pattern.slice(parsed.length);

    if (!remainder || !/^\d+$/.test(remainder)) {
      throw new BadRequestException(
        `Pattern "${pattern}" must be <prefix><series> with a numeric series`,
      );
    }

    return {
      prefix: parsed,
      series: Number.parseInt(remainder, 10),
    };
  }

  private parseCode(module: CodegenModule, code: string): {
    prefix: string;
    series: number;
  } {
    const prefix = this.matchPrefix(module, code);
    const remainder = code.slice(prefix.length);

    if (!remainder || !/^\d+$/.test(remainder)) {
      throw new BadRequestException(
        `Code "${code}" must contain a numeric series after prefix "${prefix}"`,
      );
    }

    return {
      prefix,
      series: Number.parseInt(remainder, 10),
    };
  }

  private matchPrefix(module: CodegenModule, value: string): string {
    const prefixes = this.getPrefixes(module)
      .map((p) => p.toUpperCase())
      .sort((a, b) => b.length - a.length);

    const normalized = value.toUpperCase();
    const matched = prefixes.find((prefix) => normalized.startsWith(prefix));

    if (!matched) {
      throw new BadRequestException(
        `No configured prefix matches input "${value}" for module ${module}`,
      );
    }

    return matched;
  }

  private async getLastSeries(
    module: CodegenModule,
    prefix: string,
  ): Promise<number> {
    const normalizedPrefix = prefix.toUpperCase();

    switch (module) {
      case 'stockcard': {
        const rows = await this.prisma.stockcard.findMany({
          where: { barcode: { startsWith: normalizedPrefix } },
          select: { barcode: true },
        });

        return rows.reduce((max, row) => {
          if (!row.barcode) return max;
          try {
            const parsed = this.parseCode(module, row.barcode.toUpperCase());
            if (parsed.prefix !== normalizedPrefix) return max;
            return Math.max(max, parsed.series);
          } catch {
            return max;
          }
        }, 0);
      }
      case 'customer':
        return 0;
      default:
        return 0;
    }
  }

  private getPrefixes(module: string): string[] {
    return this.config.prefixes[module] ?? [];
  }

  private assertKnownPrefix(module: CodegenModule, prefix: string): void {
    const prefixes = this.getPrefixes(module).map((p) => p.toUpperCase());
    const normalized = prefix.toUpperCase();

    if (!prefixes.includes(normalized)) {
      throw new BadRequestException(
        `Prefix "${prefix}" is not configured for module ${module}`,
      );
    }
  }

  private assertModule(module: string): asserts module is CodegenModule {
    if (!(CODEGEN_MODULES as string[]).includes(module)) {
      throw new NotFoundException(
        `Unknown module "${module}". Allowed: ${CODEGEN_MODULES.join(', ')}`,
      );
    }
  }

  private loadConfig(): CodegenConfig {
    const configPath = join(process.cwd(), 'config', 'codegen.config.json');
    const raw = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as CodegenConfig;

    if (
      typeof parsed.codegenLength !== 'number' ||
      parsed.codegenLength < 2 ||
      !parsed.prefixes ||
      typeof parsed.prefixes !== 'object'
    ) {
      throw new Error('Invalid codegen.config.json structure');
    }

    if (typeof parsed.defaultUom !== 'string' || !parsed.defaultUom.trim()) {
      parsed.defaultUom = 'pcs';
    } else {
      parsed.defaultUom = parsed.defaultUom.trim();
    }

    if (!Array.isArray(parsed.priceGroups) || parsed.priceGroups.length === 0) {
      parsed.priceGroups = [
        'RETAIL',
        'WHOLESALE',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
      ];
    } else {
      parsed.priceGroups = parsed.priceGroups
        .map((g) => String(g).trim())
        .filter(Boolean);
    }

    return parsed;
  }
}
