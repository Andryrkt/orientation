import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from '../users/users.service';
import { DomainesService } from '../domaines/domaines.service';
import { MetiersService } from '../metiers/metiers.service';
import { UniversitesService } from '../universites/universites.service';
import { MentionsService } from '../mentions/mentions.service';
import { ParcoursService } from '../parcours/parcours.service';
import { StagesService } from '../stages/stages.service';
import { BoursesService } from '../bourses/bourses.service';
import { BlogsService } from '../blogs/blogs.service';
import { QuestionnairesService } from '../questionnaires/questionnaires.service';
import { CoachsService } from '../coachs/coachs.service';
import { CentresFormationService } from '../centres-formation/centres-formation.service';
import { TicketsService } from '../tickets/tickets.service';

@ApiBearerAuth()
@ApiTags('admin')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private domainesService: DomainesService,
    private metiersService: MetiersService,
    private universitesService: UniversitesService,
    private mentionsService: MentionsService,
    private parcoursService: ParcoursService,
    private stagesService: StagesService,
    private boursesService: BoursesService,
    private blogsService: BlogsService,
    private questionnairesService: QuestionnairesService,
    private coachsService: CoachsService,
    private centresFormationService: CentresFormationService,
    private ticketsService: TicketsService,
  ) {}

  @Get('stats')
  async stats() {
    const [
      utilisateurs,
      domaines,
      metiers,
      universites,
      mentions,
      parcours,
      stages,
      bourses,
      blogs,
      testsCompletes,
      coachs,
      centresFormation,
      tickets,
    ] = await Promise.all([
      this.usersService.countAll(),
      this.domainesService.countAll(),
      this.metiersService.countAll(),
      this.universitesService.countAll(),
      this.mentionsService.countAll(),
      this.parcoursService.countAll(),
      this.stagesService.countAll(),
      this.boursesService.countAll(),
      this.blogsService.countAll(),
      this.questionnairesService.countAll(),
      this.coachsService.countAll(),
      this.centresFormationService.countAll(),
      this.ticketsService.countAll(),
    ]);
    return {
      utilisateurs,
      domaines,
      metiers,
      universites,
      mentions,
      parcours,
      stages,
      bourses,
      blogs,
      testsCompletes,
      coachs,
      centresFormation,
      tickets,
    };
  }
}
