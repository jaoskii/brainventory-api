import { CreatePriceDto } from './create-price.dto';
import { CreateUomDto } from './create-uom.dto';

export interface CreateStockcardDto {
  barcode?: string;
  description?: string;
  defaultUom?: string;
  brandId?: number;
  modelId?: number;
  classId?: number;
  locationId?: number;
  sizeId?: number;
  categoryId?: number;
  groupId?: number;
  itemRem?: string;
  daysToExpiry?: number;
  maximum?: number | string;
  minimum?: number | string;
  inactive?: boolean;
  imported?: boolean;
  assets?: string;
  assetsId?: number;
  liabilities?: string;
  liabilitiesId?: number;
  revenue?: string;
  revenueId?: number;
  expense?: string;
  expenseId?: number;
  isActive?: boolean;
  uoms?: CreateUomDto[];
  prices?: CreatePriceDto[];
}
