import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { FilieresService } from './filieres.service';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';

@ApiTags('filieres')
@ApiBearerAuth()
@Controller()
export class FilieresController {
  constructor(private filieresService: FilieresService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE, Role.ADMIN)
  @Get('filieres')
  findAllActives() {
    return this.filieresService.findAllActives();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/filieres')
  create(@Body() dto: CreateFiliereDto) {
    return this.filieresService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/filieres')
  findAllAdmin() {
    return this.filieresService.findAllAdmin();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/filieres/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFiliereDto) {
    return this.filieresService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/filieres/:id')
  remove(@Param('id') id: string) {
    return this.filieresService.remove(id);
  }
}
