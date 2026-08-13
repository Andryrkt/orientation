import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SaisiesJournalieresService } from './saisies-journalieres.service';
import { SubmitSaisieDto } from './dto/submit-saisie.dto';
import { UpdateSaisieDto } from './dto/update-saisie.dto';
import { QuerySaisiesDto } from './dto/query-saisies.dto';
import { QueryEtudiantsDto } from './dto/query-etudiants.dto';
import { CreateMouvementDto } from './dto/create-mouvement.dto';
import { UpdateDatesCoursDto } from './dto/update-dates-cours.dto';

@ApiTags('saisies-journalieres')
@ApiBearerAuth()
@Controller()
export class SaisiesJournalieresController {
  constructor(private saisiesJournalieresService: SaisiesJournalieresService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Post('saisies-journalieres')
  submit(@CurrentUser() user: { id: string }, @Body() dto: SubmitSaisieDto) {
    return this.saisiesJournalieresService.submit(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Get('saisies-journalieres/today')
  today(@CurrentUser() user: { id: string }) {
    return this.saisiesJournalieresService.today(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Post('saisies-journalieres/mouvements')
  ajouterMouvement(@CurrentUser() user: { id: string }, @Body() dto: CreateMouvementDto) {
    return this.saisiesJournalieresService.ajouterMouvement(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Get('saisies-journalieres/mouvements/aujourdhui')
  mouvementsAujourdhui(@CurrentUser() user: { id: string }) {
    return this.saisiesJournalieresService.mouvementsAujourdhui(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Get('saisies-journalieres/mouvements/recherche')
  rechercherEtudiants(@CurrentUser() user: { id: string }, @Query('q') q: string) {
    return this.saisiesJournalieresService.rechercherEtudiants(user.id, q);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Delete('saisies-journalieres/mouvements/:id')
  supprimerMouvement(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.saisiesJournalieresService.supprimerMouvement(user.id, id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Get('saisies-journalieres/filieres-inscrites/suivi')
  filieresInscritesSuivi(@CurrentUser() user: { id: string }) {
    return this.saisiesJournalieresService.filieresInscritesSuivi(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE)
  @Patch('saisies-journalieres/filieres-inscrites/:id/dates-cours')
  definirDatesCoursFiliere(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateDatesCoursDto,
  ) {
    return this.saisiesJournalieresService.definirDatesCoursFiliere(user.id, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Get('admin/saisies-journalieres')
  findAllAdmin(@Query() query: QuerySaisiesDto) {
    return this.saisiesJournalieresService.findAllAdmin(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Get('admin/etudiants')
  findAllEtudiantsAdmin(@Query() query: QueryEtudiantsDto) {
    return this.saisiesJournalieresService.findAllEtudiantsAdmin(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Get('admin/saisies-journalieres/resume')
  resumeAdmin(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('pointDeVenteId') pointDeVenteId?: string,
  ) {
    return this.saisiesJournalieresService.resumeAdmin({ dateFrom, dateTo, pointDeVenteId });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Get('admin/saisies-journalieres/resume-semaine')
  resumeParSemaine(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('pointDeVenteId') pointDeVenteId?: string,
  ) {
    return this.saisiesJournalieresService.resumeParSemaine({ dateFrom, dateTo, pointDeVenteId });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Patch('admin/saisies-journalieres/:id')
  updateAdmin(@Param('id') id: string, @Body() dto: UpdateSaisieDto) {
    return this.saisiesJournalieresService.updateAdmin(id, dto);
  }
}
