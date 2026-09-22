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
import { ConcoursService } from './concours.service';
import { CreateConcoursDto } from './dto/create-concours.dto';
import { UpdateConcoursDto } from './dto/update-concours.dto';
import { QueryConcoursDto } from './dto/query-concours.dto';

@ApiTags('concours')
@Controller('concours')
export class ConcoursController {
  constructor(private concoursService: ConcoursService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryConcoursDto) {
    return this.concoursService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.concoursService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateConcoursDto) {
    return this.concoursService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConcoursDto) {
    return this.concoursService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.concoursService.remove(id);
  }
}
