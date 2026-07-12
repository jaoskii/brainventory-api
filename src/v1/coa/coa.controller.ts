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
import { CoaService } from './coa.service';
import { CreateCoaDto } from './dto/create-coa.dto';
import { UpdateCoaDto } from './dto/update-coa.dto';

@Controller('v1/coa')
export class CoaController {
  constructor(private readonly coaService: CoaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateCoaDto) {
    return this.coaService.create(body);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.coaService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 100,
      search,
    );
  }

  @Get('tree')
  findTree() {
    return this.coaService.findTree();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.coaService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCoaDto) {
    return this.coaService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coaService.remove(id);
  }
}
