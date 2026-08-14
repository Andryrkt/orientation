import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { EmploiDuTempsService } from './emploi-du-temps.service';
import { CreateSeanceCoursDto } from './dto/create-seance-cours.dto';
import { UpdateSeanceCoursDto } from './dto/update-seance-cours.dto';

@ApiTags('emploi-du-temps')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
@Controller('admin/emploi-du-temps')
export class EmploiDuTempsController {
  constructor(private emploiDuTempsService: EmploiDuTempsService) {}

  @Get()
  findAll(@Query('filiereId') filiereId?: string, @Query('enseignantId') enseignantId?: string) {
    return this.emploiDuTempsService.findAll(filiereId, enseignantId);
  }

  @Post()
  create(@Body() dto: CreateSeanceCoursDto) {
    return this.emploiDuTempsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSeanceCoursDto) {
    return this.emploiDuTempsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emploiDuTempsService.remove(id);
  }
}
