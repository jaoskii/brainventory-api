import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSubfieldDto } from './dto/create-subfield.dto';
import { UpdateSubfieldDto } from './dto/update-subfield.dto';
import { SubfieldsService } from './subfields.service';

@Controller('v1/stockcard/subfields')
export class SubfieldsController {
  constructor(private readonly subfieldsService: SubfieldsService) {}

  @Get(':type')
  findAll(@Param('type') type: string, @Query('search') search?: string) {
    return this.subfieldsService.findAll(type, search);
  }

  @Get(':type/:id')
  findOne(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subfieldsService.findOne(type, id);
  }

  @Post(':type')
  @HttpCode(HttpStatus.CREATED)
  create(@Param('type') type: string, @Body() body: CreateSubfieldDto) {
    return this.subfieldsService.create(type, body);
  }

  @Patch(':type/:id')
  update(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSubfieldDto,
  ) {
    return this.subfieldsService.update(type, id, body);
  }
}
