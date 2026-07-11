import { Module } from '@nestjs/common';
import { StockcardController } from './stockcard.controller';
import { StockcardService } from './stockcard.service';

@Module({
  controllers: [StockcardController],
  providers: [StockcardService],
})
export class StockcardModule {}
