import { CreatePriceDto } from './create-price.dto';
import { CreateUomDto } from './create-uom.dto';

export interface CreateStockcardDto {
  barcode?: string;
  description?: string;
  defaultUom?: string;
  model?: string;
  className?: string;
  brand?: string;
  storeLocation?: string;
  size?: string;
  category?: string;
  groupName?: string;
  itemRem?: string;
  daysToExpiry?: number;
  maximum?: number | string;
  minimum?: number | string;
  inactive?: boolean;
  imported?: boolean;
  assets?: string;
  liabilities?: string;
  revenue?: string;
  expense?: string;
  isActive?: boolean;
  uoms?: CreateUomDto[];
  prices?: CreatePriceDto[];
}
