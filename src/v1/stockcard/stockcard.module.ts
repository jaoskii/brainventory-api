import { Module } from '@nestjs/common';
import { CodegenModule } from '../codegen/codegen.module';
import { SubfieldsController } from './subfields/subfields.controller';
import { SubfieldsService } from './subfields/subfields.service';
import { StockcardController } from './stockcard.controller';
import { StockcardService } from './stockcard.service';

@Module({
  imports: [CodegenModule],
  controllers: [StockcardController, SubfieldsController],
  providers: [StockcardService, SubfieldsService],
  exports: [SubfieldsService],
})
export class StockcardModule {}
