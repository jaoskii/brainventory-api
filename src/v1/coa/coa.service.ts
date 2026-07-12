import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCoaDto } from './dto/create-coa.dto';
import { UpdateCoaDto } from './dto/update-coa.dto';

export interface CoaTreeNode {
  id: number;
  code: string;
  description: string | null;
  level: number | null;
  alias: string | null;
  parentCode: string | null;
  category: string | null;
  children: CoaTreeNode[];
}

@Injectable()
export class CoaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCoaDto) {
    this.validatePayload(dto);
    await this.assertCodeAvailable(dto.code);
    await this.assertParentExists(dto.parentCode);

    const level =
      dto.level ?? (await this.resolveLevelFromParent(dto.parentCode));

    return this.prisma.coa.create({
      data: {
        code: dto.code.trim(),
        description: dto.description ?? null,
        level,
        alias: dto.alias ?? null,
        parentCode: dto.parentCode?.trim() || null,
        category: dto.category ?? null,
      },
    });
  }

  async findAll(page = 1, limit = 100, search?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 500);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.CoaWhereInput = search
      ? {
          OR: [
            { code: { contains: search } },
            { description: { contains: search } },
            { alias: { contains: search } },
            { category: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.coa.findMany({
        where,
        orderBy: [{ code: 'asc' }],
        skip,
        take: safeLimit,
      }),
      this.prisma.coa.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  }

  async findTree(): Promise<CoaTreeNode[]> {
    const rows = await this.prisma.coa.findMany({
      orderBy: [{ code: 'asc' }],
    });

    const byCode = new Map<string, CoaTreeNode>();
    for (const row of rows) {
      byCode.set(row.code, {
        id: row.id,
        code: row.code,
        description: row.description,
        level: row.level,
        alias: row.alias,
        parentCode: row.parentCode,
        category: row.category,
        children: [],
      });
    }

    const roots: CoaTreeNode[] = [];
    for (const node of byCode.values()) {
      if (node.parentCode && byCode.has(node.parentCode)) {
        byCode.get(node.parentCode)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findOne(id: number) {
    const row = await this.prisma.coa.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`COA account ${id} not found`);
    return row;
  }

  async findByCode(code: string) {
    const row = await this.prisma.coa.findUnique({ where: { code } });
    if (!row) throw new NotFoundException(`COA account ${code} not found`);
    return row;
  }

  async update(id: number, dto: UpdateCoaDto) {
    const existing = await this.findOne(id);

    if (dto.code !== undefined && dto.code.trim() !== existing.code) {
      this.validateCode(dto.code);
      await this.assertCodeAvailable(dto.code, id);
    }

    if (dto.parentCode !== undefined) {
      const parentCode = dto.parentCode?.trim() || null;
      const selfCode = dto.code?.trim() ?? existing.code;
      if (parentCode === selfCode) {
        throw new BadRequestException('Account cannot be its own parent');
      }
      await this.assertParentExists(parentCode);
      await this.assertNotDescendant(existing.code, parentCode);
    }

    const data: Prisma.CoaUpdateInput = {};
    if (dto.code !== undefined) data.code = dto.code.trim();
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.level !== undefined) data.level = dto.level;
    if (dto.alias !== undefined) data.alias = dto.alias;
    if (dto.parentCode !== undefined) {
      data.parent = dto.parentCode?.trim()
        ? { connect: { code: dto.parentCode.trim() } }
        : { disconnect: true };
    }
    if (dto.category !== undefined) data.category = dto.category;

    if (dto.level === undefined && dto.parentCode !== undefined) {
      data.level = await this.resolveLevelFromParent(
        dto.parentCode?.trim() || null,
      );
    }

    return this.prisma.coa.update({ where: { id }, data });
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    const childCount = await this.prisma.coa.count({
      where: { parentCode: existing.code },
    });
    if (childCount > 0) {
      throw new ConflictException(
        `Cannot delete ${existing.code}: has ${childCount} child account(s)`,
      );
    }
    return this.prisma.coa.delete({ where: { id } });
  }

  private validatePayload(dto: CreateCoaDto) {
    this.validateCode(dto.code);
    if (dto.level !== undefined && dto.level !== null && dto.level < 1) {
      throw new BadRequestException('level must be >= 1');
    }
  }

  private validateCode(code: string) {
    if (!code?.trim()) {
      throw new BadRequestException('code is required');
    }
  }

  private async assertCodeAvailable(code: string, excludeId?: number) {
    const found = await this.prisma.coa.findUnique({
      where: { code: code.trim() },
      select: { id: true },
    });
    if (found && found.id !== excludeId) {
      throw new ConflictException(`COA code ${code} already exists`);
    }
  }

  private async assertParentExists(parentCode?: string | null) {
    if (!parentCode?.trim()) return;
    const parent = await this.prisma.coa.findUnique({
      where: { code: parentCode.trim() },
      select: { id: true },
    });
    if (!parent) {
      throw new BadRequestException(`Parent code ${parentCode} not found`);
    }
  }

  private async resolveLevelFromParent(
    parentCode?: string | null,
  ): Promise<number> {
    if (!parentCode?.trim()) return 1;
    const parent = await this.prisma.coa.findUnique({
      where: { code: parentCode.trim() },
      select: { level: true },
    });
    return (parent?.level ?? 1) + 1;
  }

  private async assertNotDescendant(code: string, parentCode: string | null) {
    if (!parentCode) return;

    const rows = await this.prisma.coa.findMany({
      select: { code: true, parentCode: true },
    });
    const parentByCode = new Map(rows.map((r) => [r.code, r.parentCode]));

    let cursor: string | null = parentCode;
    const seen = new Set<string>();
    while (cursor) {
      if (cursor === code) {
        throw new BadRequestException(
          'Invalid parent: would create a circular reference',
        );
      }
      if (seen.has(cursor)) break;
      seen.add(cursor);
      cursor = parentByCode.get(cursor) ?? null;
    }
  }
}
