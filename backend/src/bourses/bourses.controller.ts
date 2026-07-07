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
import { BoursesService } from './bourses.service';
import { CreateBourseDto } from './dto/create-bourse.dto';
import { UpdateBourseDto } from './dto/update-bourse.dto';
import { QueryBourseDto } from './dto/query-bourse.dto';

@ApiTags('bourses')
@Controller('bourses')
export class BoursesController {
  constructor(private boursesService: BoursesService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryBourseDto) {
    return this.boursesService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boursesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateBourseDto) {
    return this.boursesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBourseDto) {
    return this.boursesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boursesService.remove(id);
  }
}
