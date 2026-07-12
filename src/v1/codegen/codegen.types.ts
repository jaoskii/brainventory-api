export type CodegenModule = 'stockcard' | 'customer';

export type CodegenTrigger = 'prefix_enter' | 'new' | 'pattern';

export interface CodegenConfig {
  codegenLength: number;
  defaultUom: string;
  prefixes: Record<string, string[]>;
  priceGroups: string[];
}

export interface GeneratedCode {
  code: string;
  prefix: string;
  series: number;
  module: string;
  codegenLength: number;
}

export const CODEGEN_MODULES: CodegenModule[] = ['stockcard', 'customer'];
