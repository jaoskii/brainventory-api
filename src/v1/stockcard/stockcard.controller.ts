import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateStockcardDto } from './dto/create-stockcard.dto';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { UpdateStockcardDto } from './dto/update-stockcard.dto';
import { UpdateTaggingDto } from './dto/update-tagging.dto';
import { UpdateUomDto } from './dto/update-uom.dto';
import { StockcardService } from './stockcard.service';

@Controller('v1/stockcard')
export class StockcardController {
  constructor(private readonly stockcardService: StockcardService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateStockcardDto) {
    return this.stockcardService.create(body);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.stockcardService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockcardService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStockcardDto,
  ) {
    return this.stockcardService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockcardService.remove(id);
  }

  @Patch(':id/lock')
  lock(@Param('id', ParseIntPipe) id: number) {
    return this.stockcardService.lock(id);
  }

  @Patch(':id/unlock')
  unlock(@Param('id', ParseIntPipe) id: number) {
    return this.stockcardService.unlock(id);
  }

  @Patch(':id/tagging')
  updateTagging(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTaggingDto,
  ) {
    return this.stockcardService.updateTagging(id, body);
  }

  @Get(':id/uoms')
  findUoms(@Param('id', ParseIntPipe) id: number) {
    return this.stockcardService.findUoms(id);
  }

  @Post(':id/uoms')
  @HttpCode(HttpStatus.CREATED)
  createUom(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateUomDto,
  ) {
    return this.stockcardService.createUom(id, body);
  }

  @Patch(':id/uoms/:uomId')
  updateUom(
    @Param('id', ParseIntPipe) id: number,
    @Param('uomId', ParseIntPipe) uomId: number,
    @Body() body: UpdateUomDto,
  ) {
    return this.stockcardService.updateUom(id, uomId, body);
  }

  @Delete(':id/uoms/:uomId')
  removeUom(
    @Param('id', ParseIntPipe) id: number,
    @Param('uomId', ParseIntPipe) uomId: number,
  ) {
    return this.stockcardService.removeUom(id, uomId);
  }

  @Get(':id/prices')
  findPrices(@Param('id', ParseIntPipe) id: number) {
    return this.stockcardService.findPrices(id);
  }

  @Post(':id/prices')
  @HttpCode(HttpStatus.CREATED)
  createPrice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreatePriceDto,
  ) {
    return this.stockcardService.createPrice(id, body);
  }

  @Patch(':id/prices/:priceId')
  updatePrice(
    @Param('id', ParseIntPipe) id: number,
    @Param('priceId', ParseIntPipe) priceId: number,
    @Body() body: UpdatePriceDto,
  ) {
    return this.stockcardService.updatePrice(id, priceId, body);
  }

  @Delete(':id/prices/:priceId')
  removePrice(
    @Param('id', ParseIntPipe) id: number,
    @Param('priceId', ParseIntPipe) priceId: number,
  ) {
    return this.stockcardService.removePrice(id, priceId);
  }
}
