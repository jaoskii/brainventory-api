import { Module } from '@nestjs/common';
import { AuthModule } from './v1/auth/auth.module';
import { StockcardModule } from './v1/stockcard/stockcard.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, StockcardModule],
})
export class AppModule {}
