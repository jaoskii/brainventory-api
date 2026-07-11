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

const STOCKCARD_SCALAR_FIELDS = [
  'barcode',
  'description',
  'defaultUom',
  'model',
  'className',
  'brand',
  'storeLocation',
  'size',
  'category',
  'groupName',
  'itemRem',
  'daysToExpiry',
  'maximum',
  'minimum',
  'inactive',
  'imported',
  'assets',
  'liabilities',
  'revenue',
  'expense',
  'isActive',
] as const;

const TAGGING_FIELDS = [
  'category',
  'groupName',
  'className',
  'brand',
  'model',
  'size',
  'storeLocation',
] as const;

const STOCKCARD_INCLUDE = { uoms: true, prices: true } as const;

@Injectable()
export class StockcardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStockcardDto) {
    this.validateUoms(dto.uoms);
    this.validatePrices(dto.prices);

    const data = this.buildScalarFields(dto) as Prisma.StockcardCreateInput;

    if (dto.uoms?.length) {
      data.uoms = { create: dto.uoms.map((uom) => this.buildUomCreateData(uom)) };
    }

    if (dto.prices?.length) {
      data.prices = {
        create: dto.prices.map((price) => this.buildPriceCreateData(price)),
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
            { brand: { contains: search } },
            { category: { contains: search } },
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

  async update(id: number, dto: UpdateStockcardDto) {
    await this.assertNotLocked(id);
    this.validateUoms(dto.uoms);
    this.validatePrices(dto.prices);

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

    return this.prisma.uom.create({
      data: {
        itemId: stockcardId,
        ...this.buildUomCreateData(dto),
      },
    });
  }

  async updateUom(stockcardId: number, uomId: number, dto: UpdateUomDto) {
    await this.assertNotLocked(stockcardId);
    await this.assertUomBelongsToStockcard(stockcardId, uomId);

    return this.prisma.uom.update({
      where: { id: uomId },
      data: this.buildUomUpdateData(dto),
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
      price: price.price,
    };
  }

  private buildPriceUpdateData(
    price: UpdatePriceDto,
  ): Prisma.StockcardPriceUpdateInput {
    const data: Prisma.StockcardPriceUpdateInput = {};

    if (price.pricegrp !== undefined) data.pricegrp = price.pricegrp;
    if (price.price !== undefined) data.price = price.price;

    return data;
  }
}
