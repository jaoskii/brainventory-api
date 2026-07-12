import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateStockcardDto } from './dto/create-stockcard.dto';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateStockcardDto } from './dto/update-stockcard.dto';
import { UpdateTaggingDto } from './dto/update-tagging.dto';
import { UpdateUomDto } from './dto/update-uom.dto';
import { CodegenService } from '../codegen/codegen.service';
import { SubfieldsService } from './subfields/subfields.service';
import { SUBFIELD_FK_FIELDS, SubfieldType } from './subfields/subfields.types';

const STOCKCARD_SCALAR_FIELDS = [
  'barcode',
  'description',
  'defaultUom',
  'brandId',
  'modelId',
  'classId',
  'locationId',
  'sizeId',
  'categoryId',
  'groupId',
  'itemRem',
  'daysToExpiry',
  'maximum',
  'minimum',
  'inactive',
  'imported',
  'assets',
  'assetsId',
  'liabilities',
  'liabilitiesId',
  'revenue',
  'revenueId',
  'expense',
  'expenseId',
  'isActive',
] as const;

const TAGGING_FIELDS = [
  'categoryId',
  'groupId',
  'classId',
  'brandId',
  'modelId',
  'sizeId',
  'locationId',
] as const;

const STOCKCARD_INCLUDE = {
  uoms: true,
  prices: true,
  brand: true,
  stockcardModel: true,
  stockcardClass: true,
  location: true,
  size: true,
  category: true,
  stockcardGroup: true,
} as const;

const SUBFIELD_TYPE_BY_FK: Record<string, SubfieldType> = Object.fromEntries(
  Object.entries(SUBFIELD_FK_FIELDS).map(([type, fk]) => [fk, type as SubfieldType]),
);

@Injectable()
export class StockcardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subfieldsService: SubfieldsService,
    private readonly codegenService: CodegenService,
  ) {}

  async create(dto: CreateStockcardDto) {
    this.validateUoms(dto.uoms);
    this.validatePrices(dto.prices);
    await this.validateSubfieldIds(dto);

    const data = this.buildScalarFields(dto) as Prisma.StockcardCreateInput;
    const prices = this.buildDefaultPriceRows(dto.prices);

    if (dto.uoms?.length) {
      data.uoms = { create: dto.uoms.map((uom) => this.buildUomCreateData(uom)) };
    }

    if (prices.length) {
      data.prices = {
        create: prices.map((price) => this.buildPriceCreateData(price)),
      };
    }

    return this.prisma.stockcard.create({
      data,
      include: STOCKCARD_INCLUDE,
    });
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.StockcardWhereInput = search
      ? {
          OR: [
            { barcode: { contains: search } },
            { description: { contains: search } },
            { brand: { description: { contains: search } } },
            { category: { description: { contains: search } } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.stockcard.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { id: 'desc' },
        include: STOCKCARD_INCLUDE,
      }),
      this.prisma.stockcard.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: number) {
    const stockcard = await this.prisma.stockcard.findUnique({
      where: { id },
      include: STOCKCARD_INCLUDE,
    });

    if (!stockcard) {
      throw new NotFoundException(`Stockcard ${id} not found`);
    }

    return stockcard;
  }

  async findByBarcode(barcode: string) {
    const normalized = barcode.trim();
    if (!normalized) {
      throw new BadRequestException('Barcode is required');
    }

    const stockcard = await this.prisma.stockcard.findFirst({
      where: { barcode: normalized },
      include: STOCKCARD_INCLUDE,
    });

    return stockcard ?? null;
  }

  async update(id: number, dto: UpdateStockcardDto) {
    await this.assertNotLocked(id);
    this.validateUoms(dto.uoms);
    this.validatePrices(dto.prices);
    await this.validateSubfieldIds(dto);

    const { uoms, prices, ...rest } = dto;
    const data = this.buildScalarFields(rest) as Prisma.StockcardUpdateInput;

    if (uoms !== undefined || prices !== undefined) {
      return this.prisma.$transaction(async (tx) => {
        if (uoms !== undefined) {
          await tx.uom.deleteMany({ where: { itemId: id } });
        }

        if (prices !== undefined) {
          await tx.stockcardPrice.deleteMany({ where: { itemId: id } });
        }

        return tx.stockcard.update({
          where: { id },
          data: {
            ...data,
            ...(uoms?.length
              ? { uoms: { create: uoms.map((uom) => this.buildUomCreateData(uom)) } }
              : {}),
            ...(prices?.length
              ? {
                  prices: {
                    create: prices.map((price) => this.buildPriceCreateData(price)),
                  },
                }
              : {}),
          },
          include: STOCKCARD_INCLUDE,
        });
      });
    }

    return this.prisma.stockcard.update({
      where: { id },
      data,
      include: STOCKCARD_INCLUDE,
    });
  }

  async remove(id: number) {
    await this.assertNotLocked(id);
    await this.findOne(id);

    return this.prisma.stockcard.delete({
      where: { id },
      include: STOCKCARD_INCLUDE,
    });
  }

  async lock(id: number) {
    await this.findOne(id);

    return this.prisma.stockcard.update({
      where: { id },
      data: { isLocked: true },
      include: STOCKCARD_INCLUDE,
    });
  }

  async unlock(id: number) {
    await this.findOne(id);

    return this.prisma.stockcard.update({
      where: { id },
      data: { isLocked: false },
      include: STOCKCARD_INCLUDE,
    });
  }

  async updateTagging(id: number, dto: UpdateTaggingDto) {
    await this.assertNotLocked(id);
    await this.validateSubfieldIds(dto);

    const data = this.buildScalarFields(dto) as Prisma.StockcardUpdateInput;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one tagging field is required');
    }

    return this.prisma.stockcard.update({
      where: { id },
      data,
      include: STOCKCARD_INCLUDE,
    });
  }

  async findUoms(stockcardId: number) {
    await this.findOne(stockcardId);

    return this.prisma.uom.findMany({
      where: { itemId: stockcardId },
      orderBy: { id: 'asc' },
    });
  }

  async createUom(stockcardId: number, dto: CreateUomDto) {
    await this.assertNotLocked(stockcardId);
    this.validateUoms([dto]);
    await this.findOne(stockcardId);

    const uomName = dto.uom.trim();
    const factor = this.parseRequiredFactor(dto.factor, { allowOne: false });

    await this.assertUomNameAvailable(stockcardId, uomName);
    await this.assertUomFactorAvailable(stockcardId, factor);

    return this.prisma.uom.create({
      data: {
        itemId: stockcardId,
        ...this.buildUomCreateData({
          ...dto,
          uom: uomName,
          factor,
          desc: dto.desc?.trim() || undefined,
        }),
      },
    });
  }

  async updateUom(stockcardId: number, uomId: number, dto: UpdateUomDto) {
    await this.assertNotLocked(stockcardId);
    await this.assertUomBelongsToStockcard(stockcardId, uomId);

    const data: UpdateUomDto = { ...dto };

    if (dto.uom !== undefined) {
      if (typeof dto.uom !== 'string' || !dto.uom.trim()) {
        throw new BadRequestException('uom is required');
      }
      data.uom = dto.uom.trim();
      await this.assertUomNameAvailable(stockcardId, data.uom, uomId);
    }

    if (dto.factor !== undefined) {
      data.factor = this.parseRequiredFactor(dto.factor, { allowOne: false });
      await this.assertUomFactorAvailable(stockcardId, data.factor, uomId);
    }

    if (typeof dto.desc === 'string') {
      data.desc = dto.desc.trim() || undefined;
    }

    return this.prisma.uom.update({
      where: { id: uomId },
      data: this.buildUomUpdateData(data),
    });
  }

  async removeUom(stockcardId: number, uomId: number) {
    await this.assertNotLocked(stockcardId);
    await this.assertUomBelongsToStockcard(stockcardId, uomId);

    return this.prisma.uom.delete({ where: { id: uomId } });
  }

  async findPrices(stockcardId: number) {
    await this.findOne(stockcardId);

    return this.prisma.stockcardPrice.findMany({
      where: { itemId: stockcardId },
      orderBy: { id: 'asc' },
    });
  }

  async createPrice(stockcardId: number, dto: CreatePriceDto) {
    await this.assertNotLocked(stockcardId);
    this.validatePrices([dto]);
    await this.findOne(stockcardId);

    return this.prisma.stockcardPrice.create({
      data: {
        itemId: stockcardId,
        ...this.buildPriceCreateData(dto),
      },
    });
  }

  async updatePrice(
    stockcardId: number,
    priceId: number,
    dto: UpdatePriceDto,
  ) {
    await this.assertNotLocked(stockcardId);
    await this.assertPriceBelongsToStockcard(stockcardId, priceId);

    return this.prisma.stockcardPrice.update({
      where: { id: priceId },
      data: this.buildPriceUpdateData(dto),
    });
  }

  async removePrice(stockcardId: number, priceId: number) {
    await this.assertNotLocked(stockcardId);
    await this.assertPriceBelongsToStockcard(stockcardId, priceId);

    return this.prisma.stockcardPrice.delete({ where: { id: priceId } });
  }

  private async assertNotLocked(id: number) {
    const stockcard = await this.prisma.stockcard.findUnique({
      where: { id },
      select: { isLocked: true },
    });

    if (!stockcard) {
      throw new NotFoundException(`Stockcard ${id} not found`);
    }

    if (stockcard.isLocked) {
      throw new ForbiddenException(`Stockcard ${id} is locked`);
    }
  }

  private async assertUomBelongsToStockcard(
    stockcardId: number,
    uomId: number,
  ) {
    const uom = await this.prisma.uom.findFirst({
      where: { id: uomId, itemId: stockcardId },
    });

    if (!uom) {
      throw new NotFoundException(
        `UOM ${uomId} not found for stockcard ${stockcardId}`,
      );
    }

    return uom;
  }

  private async assertPriceBelongsToStockcard(
    stockcardId: number,
    priceId: number,
  ) {
    const price = await this.prisma.stockcardPrice.findFirst({
      where: { id: priceId, itemId: stockcardId },
    });

    if (!price) {
      throw new NotFoundException(
        `Price ${priceId} not found for stockcard ${stockcardId}`,
      );
    }

    return price;
  }

  private validateUoms(uoms?: CreateUomDto[]) {
    if (uoms === undefined) {
      return;
    }

    if (!Array.isArray(uoms)) {
      throw new BadRequestException('uoms must be an array');
    }

    for (const entry of uoms) {
      if (!entry?.uom || typeof entry.uom !== 'string') {
        throw new BadRequestException('Each uom entry requires a uom string');
      }
    }
  }

  private parseRequiredFactor(
    value: number | string | undefined,
    options: { allowOne: boolean },
  ): number {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException('factor is required');
    }

    const factor = typeof value === 'number' ? value : Number(String(value).trim());
    if (!Number.isFinite(factor)) {
      throw new BadRequestException('factor must be a valid number');
    }

    if (!options.allowOne && factor === 1) {
      throw new BadRequestException('Factor 1 is reserved for the default UOM');
    }

    return factor;
  }

  private async assertUomNameAvailable(
    stockcardId: number,
    uomName: string,
    excludeId?: number,
  ) {
    const existing = await this.prisma.uom.findMany({
      where: { itemId: stockcardId },
      select: { id: true, uom: true },
    });

    const duplicate = existing.find(
      (row) =>
        row.id !== excludeId &&
        row.uom.trim().toLowerCase() === uomName.trim().toLowerCase(),
    );

    if (duplicate) {
      throw new BadRequestException(
        `UOM "${uomName}" already exists on this stock card`,
      );
    }
  }

  private async assertUomFactorAvailable(
    stockcardId: number,
    factor: number,
    excludeId?: number,
  ) {
    const existing = await this.prisma.uom.findMany({
      where: { itemId: stockcardId },
      select: { id: true, factor: true },
    });

    const duplicate = existing.find((row) => {
      if (row.id === excludeId || row.factor == null) return false;
      return Number(row.factor) === factor;
    });

    if (duplicate) {
      throw new BadRequestException(
        `Factor ${factor} is already used by another UOM on this stock card`,
      );
    }
  }

  private validatePrices(prices?: CreatePriceDto[]) {
    if (prices === undefined) {
      return;
    }

    if (!Array.isArray(prices)) {
      throw new BadRequestException('prices must be an array');
    }

    for (const entry of prices) {
      if (!entry?.pricegrp || typeof entry.pricegrp !== 'string') {
        throw new BadRequestException(
          'Each price entry requires a pricegrp string',
        );
      }
    }
  }


  private async validateSubfieldIds(
    dto: Partial<CreateStockcardDto> | UpdateTaggingDto,
  ) {
    for (const [field, type] of Object.entries(SUBFIELD_TYPE_BY_FK)) {
      const value = (dto as Record<string, unknown>)[field];
      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new BadRequestException(`${field} must be an integer`);
      }

      await this.subfieldsService.assertExists(type, value);
    }
  }

  private buildScalarFields(
    dto: Partial<CreateStockcardDto> | UpdateTaggingDto,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    for (const field of STOCKCARD_SCALAR_FIELDS) {
      if (field in dto && (dto as Record<string, unknown>)[field] !== undefined) {
        data[field] = (dto as Record<string, unknown>)[field];
      }
    }

    for (const field of TAGGING_FIELDS) {
      if (field in dto && (dto as Record<string, unknown>)[field] !== undefined) {
        data[field] = (dto as Record<string, unknown>)[field];
      }
    }

    return data;
  }

  private buildUomCreateData(
    uom: CreateUomDto,
  ): Prisma.UomCreateWithoutItemInput {
    return {
      uom: uom.uom,
      factor: uom.factor,
      amt: uom.amt,
      kg: uom.kg,
      desc: uom.desc,
    };
  }

  private buildUomUpdateData(uom: UpdateUomDto): Prisma.UomUpdateInput {
    const data: Prisma.UomUpdateInput = {};

    if (uom.uom !== undefined) data.uom = uom.uom;
    if (uom.factor !== undefined) data.factor = uom.factor;
    if (uom.amt !== undefined) data.amt = uom.amt;
    if (uom.kg !== undefined) data.kg = uom.kg;
    if (uom.desc !== undefined) data.desc = uom.desc;

    return data;
  }

  private buildPriceCreateData(
    price: CreatePriceDto,
  ): Prisma.StockcardPriceCreateWithoutItemInput {
    return {
      pricegrp: price.pricegrp,
      price: price.price ?? null,
      remarks: price.remarks ?? null,
    };
  }

  private buildPriceUpdateData(
    price: UpdatePriceDto,
  ): Prisma.StockcardPriceUpdateInput {
    const data: Prisma.StockcardPriceUpdateInput = {};

    if (price.pricegrp !== undefined) data.pricegrp = price.pricegrp;
    if (price.price !== undefined) data.price = price.price;
    if (price.remarks !== undefined) data.remarks = price.remarks;

    return data;
  }

  /** Ensure configured price groups exist; overlay any provided prices. */
  private buildDefaultPriceRows(prices?: CreatePriceDto[]): CreatePriceDto[] {
    const groups = this.codegenService.getConfig().priceGroups ?? [];
    const provided = new Map<string, CreatePriceDto>();

    for (const entry of prices ?? []) {
      if (!entry?.pricegrp) continue;
      provided.set(entry.pricegrp.trim().toUpperCase(), entry);
    }

    return groups.map((group) => {
      const key = group.trim().toUpperCase();
      const existing = provided.get(key);
      if (existing) {
        return {
          pricegrp: group,
          price: existing.price ?? 0,
          remarks: existing.remarks ?? null,
        };
      }
      return {
        pricegrp: group,
        price: 0,
        remarks: null,
      };
    });
  }
}

