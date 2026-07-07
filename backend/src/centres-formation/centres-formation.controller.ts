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
import { CentresFormationService } from './centres-formation.service';
import { CreateCentreFormationDto } from './dto/create-centre-formation.dto';
import { UpdateCentreFormationDto } from './dto/update-centre-formation.dto';
import { QueryCentreFormationDto } from './dto/query-centre-formation.dto';

@ApiTags('centres-formation')
@Controller('centres-formation')
export class CentresFormationController {
  constructor(private centresFormationService: CentresFormationService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryCentreFormationDto) {
    return this.centresFormationService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.centresFormationService.findOne(slug);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCentreFormationDto) {
    return this.centresFormationService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCentreFormationDto) {
    return this.centresFormationService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centresFormationService.remove(id);
  }
}
