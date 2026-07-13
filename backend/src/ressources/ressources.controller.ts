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
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RessourcesService } from './ressources.service';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { UpdateRessourceDto } from './dto/update-ressource.dto';
import { QueryRessourceDto } from './dto/query-ressource.dto';

@ApiTags('ressources')
@Controller('ressources')
export class RessourcesController {
  constructor(private ressourcesService: RessourcesService) {}

  @Get()
  findAll(@Query() query: QueryRessourceDto) {
    return this.ressourcesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ressourcesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateRessourceDto) {
    return this.ressourcesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRessourceDto) {
    return this.ressourcesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ressourcesService.remove(id);
  }
}
