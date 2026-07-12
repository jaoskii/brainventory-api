export interface CreateCoaDto {
  code: string;
  description?: string | null;
  level?: number | null;
  alias?: string | null;
  parentCode?: string | null;
  category?: string | null;
}
