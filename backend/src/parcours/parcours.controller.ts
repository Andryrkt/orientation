import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParcoursService } from './parcours.service';
import { CreateParcoursDto } from './dto/create-parcours.dto';
import { UpdateParcoursDto } from './dto/update-parcours.dto';
import { QueryParcoursDto } from './dto/query-parcours.dto';

@ApiTags('parcours')
@Controller('parcours')
export class ParcoursController {
  constructor(private parcoursService: ParcoursService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryParcoursDto) {
    return this.parcoursService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.parcoursService.findOne(slug);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateParcoursDto) {
    return this.parcoursService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParcoursDto) {
    return this.parcoursService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parcoursService.remove(id);
  }
}
