import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSubfieldDto } from './dto/create-subfield.dto';
import { UpdateSubfieldDto } from './dto/update-subfield.dto';
import {
  SUBFIELD_DELEGATES,
  SubfieldDelegateKey,
  SubfieldRecord,
  SubfieldType,
  isSubfieldType,
} from './subfields.types';

type SubfieldDelegate = {
  findMany: (args?: {
    where?: Prisma.StockcardBrandWhereInput;
    orderBy?: { id: 'asc' | 'desc' };
  }) => Promise<SubfieldRecord[]>;
  findUnique: (args: {
    where: { id: number };
  }) => Promise<SubfieldRecord | null>;
  create: (args: {
    data: { description?: string; remarks?: string };
  }) => Promise<SubfieldRecord>;
  update: (args: {
    where: { id: number };
    data: { description?: string; remarks?: string };
  }) => Promise<SubfieldRecord>;
};

@Injectable()
export class SubfieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type: string, search?: string) {
    const subfieldType = this.parseType(type);
    const delegate = this.getDelegate(subfieldType);

    const where: Prisma.StockcardBrandWhereInput = search
      ? {
          OR: [
            { description: { contains: search } },
            { remarks: { contains: search } },
          ],
        }
      : {};

    return delegate.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(type: string, id: number) {
    const subfieldType = this.parseType(type);
    const delegate = this.getDelegate(subfieldType);
    const record = await delegate.findUnique({ where: { id } });

    if (!record) {
      throw new NotFoundException(
        `${subfieldType} subfield ${id} not found`,
      );
    }

    return record;
  }

  async create(type: string, dto: CreateSubfieldDto) {
    const subfieldType = this.parseType(type);
    const delegate = this.getDelegate(subfieldType);

    return delegate.create({
      data: {
        description: dto.description,
        remarks: dto.remarks,
      },
    });
  }

  async update(type: string, id: number, dto: UpdateSubfieldDto) {
    const subfieldType = this.parseType(type);
    const delegate = this.getDelegate(subfieldType);

    await this.findOne(type, id);

    if (dto.description === undefined && dto.remarks === undefined) {
      throw new BadRequestException('At least one field is required');
    }

    return delegate.update({
      where: { id },
      data: {
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
      },
    });
  }

  async assertExists(type: SubfieldType, id: number) {
    await this.findOne(type, id);
  }

  private parseType(type: string): SubfieldType {
    if (!isSubfieldType(type)) {
      throw new BadRequestException(
        `Invalid subfield type "${type}". Allowed: brand, model, class, location, size, category, group`,
      );
    }

    return type;
  }

  private getDelegate(type: SubfieldType): SubfieldDelegate {
    const key = SUBFIELD_DELEGATES[type] as SubfieldDelegateKey;
    return this.prisma[key] as unknown as SubfieldDelegate;
  }
}
