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
  ) {}

  @Get('stats')
  async stats() {
    const [utilisateurs, domaines, metiers, universites, mentions, parcours] = await Promise.all([
      this.usersService.countAll(),
      this.domainesService.countAll(),
      this.metiersService.countAll(),
      this.universitesService.countAll(),
      this.mentionsService.countAll(),
      this.parcoursService.countAll(),
    ]);
    return { utilisateurs, domaines, metiers, universites, mentions, parcours };
  }
}
