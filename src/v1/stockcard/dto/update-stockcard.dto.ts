import { CreateStockcardDto } from './create-stockcard.dto';

export type UpdateStockcardDto = Partial<
  Omit<CreateStockcardDto, 'uoms' | 'prices'>
> & {
  uoms?: CreateStockcardDto['uoms'];
  prices?: CreateStockcardDto['prices'];
};
