export interface CreateUomDto {
  uom: string;
  factor?: number | string;
  amt?: number | string;
  kg?: number | string;
  desc?: string;
}
