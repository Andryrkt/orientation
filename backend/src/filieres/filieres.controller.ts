import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { FilieresService } from './filieres.service';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { CreateFiliereMontantDto } from './dto/create-filiere-montant.dto';

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
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Post('admin/filieres')
  create(@Body() dto: CreateFiliereDto) {
    return this.filieresService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Get('admin/filieres')
  findAllAdmin() {
    return this.filieresService.findAllAdmin();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Patch('admin/filieres/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFiliereDto) {
    return this.filieresService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Delete('admin/filieres/:id')
  remove(@Param('id') id: string) {
    return this.filieresService.remove(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Get('admin/filieres/:id/montants')
  findMontants(@Param('id') id: string) {
    return this.filieresService.findMontants(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Post('admin/filieres/:id/montants')
  createMontant(@Param('id') id: string, @Body() dto: CreateFiliereMontantDto) {
    return this.filieresService.createMontant(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Patch('admin/filieres/:id/montants/:montantId/activer')
  activerMontant(@Param('id') id: string, @Param('montantId') montantId: string) {
    return this.filieresService.activerMontant(id, montantId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Delete('admin/filieres/:id/montants/:montantId')
  removeMontant(@Param('id') id: string, @Param('montantId') montantId: string) {
    return this.filieresService.removeMontant(id, montantId);
  }
}
