import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CodegenService } from './codegen.service';
import { GenerateCodeDto } from './dto/generate-code.dto';

@Controller('v1/codegen')
export class CodegenController {
  constructor(private readonly codegenService: CodegenService) {}

  @Get('config')
  getConfig() {
    return this.codegenService.getConfig();
  }

  @Get('config/:module')
  getModuleConfig(@Param('module') module: string) {
    return this.codegenService.getModuleConfig(module);
  }

  @Post('generate')
  generate(@Body() body: GenerateCodeDto) {
    return this.codegenService.generate(body);
  }
}
