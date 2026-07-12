import { Module } from '@nestjs/common';
import { AuthModule } from './v1/auth/auth.module';
import { CodegenModule } from './v1/codegen/codegen.module';
import { CoaModule } from './v1/coa/coa.module';
import { StockcardModule } from './v1/stockcard/stockcard.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, CodegenModule, StockcardModule, CoaModule],
})
export class AppModule {}
