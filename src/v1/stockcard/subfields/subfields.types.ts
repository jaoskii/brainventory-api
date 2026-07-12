export type SubfieldType =
  | 'brand'
  | 'model'
  | 'class'
  | 'location'
  | 'size'
  | 'category'
  | 'group';

export const SUBFIELD_TYPES: SubfieldType[] = [
  'brand',
  'model',
  'class',
  'location',
  'size',
  'category',
  'group',
];

export type SubfieldDelegateKey =
  | 'stockcardBrand'
  | 'stockcardModel'
  | 'stockcardClass'
  | 'stockcardLocation'
  | 'stockcardSize'
  | 'stockcardCategory'
  | 'stockcardGroup';

export const SUBFIELD_DELEGATES: Record<SubfieldType, SubfieldDelegateKey> = {
  brand: 'stockcardBrand',
  model: 'stockcardModel',
  class: 'stockcardClass',
  location: 'stockcardLocation',
  size: 'stockcardSize',
  category: 'stockcardCategory',
  group: 'stockcardGroup',
};

export const SUBFIELD_FK_FIELDS: Record<SubfieldType, string> = {
  brand: 'brandId',
  model: 'modelId',
  class: 'classId',
  location: 'locationId',
  size: 'sizeId',
  category: 'categoryId',
  group: 'groupId',
};

export interface SubfieldRecord {
  id: number;
  description: string | null;
  remarks: string | null;
}

export function isSubfieldType(value: string): value is SubfieldType {
  return (SUBFIELD_TYPES as string[]).includes(value);
}
