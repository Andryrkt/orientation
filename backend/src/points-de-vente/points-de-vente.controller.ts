import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PointsDeVenteService } from './points-de-vente.service';
import { CreatePointDeVenteDto } from './dto/create-point-de-vente.dto';
import { UpdatePointDeVenteDto } from './dto/update-point-de-vente.dto';
import { AssignSecretaireDto } from './dto/assign-secretaire.dto';

@ApiTags('points-de-vente')
@ApiBearerAuth()
@Controller()
export class PointsDeVenteController {
  constructor(private pointsDeVenteService: PointsDeVenteService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Get('points-de-vente/me')
  findMine(@CurrentUser() user: { id: string }) {
    return this.pointsDeVenteService.findMine(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/points-de-vente')
  create(@Body() dto: CreatePointDeVenteDto) {
    return this.pointsDeVenteService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/points-de-vente')
  findAllAdmin() {
    return this.pointsDeVenteService.findAllAdmin();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/points-de-vente/:id')
  findOne(@Param('id') id: string) {
    return this.pointsDeVenteService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/points-de-vente/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePointDeVenteDto) {
    return this.pointsDeVenteService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/points-de-vente/:id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.pointsDeVenteService.setActif(id, false);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/points-de-vente/:id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.pointsDeVenteService.setActif(id, true);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/points-de-vente/:id/secretaires')
  assignSecretaire(@Param('id') id: string, @Body() dto: AssignSecretaireDto) {
    return this.pointsDeVenteService.assignSecretaire(id, dto.utilisateurId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/points-de-vente/:id/secretaires/:utilisateurId')
  unassignSecretaire(@Param('id') id: string, @Param('utilisateurId') utilisateurId: string) {
    return this.pointsDeVenteService.unassignSecretaire(id, utilisateurId);
  }
}
