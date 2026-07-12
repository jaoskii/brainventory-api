import { CodegenModule, CodegenTrigger } from '../codegen.types';

export interface GenerateCodeDto {
  module: CodegenModule;
  trigger: CodegenTrigger;
  /** Prefix only (prefix_enter), current code (new), or pattern like SC5 / SC000005 (pattern). */
  input?: string;
}
