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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UniversitesService } from './universites.service';
import { CreateUniversiteDto } from './dto/create-universite.dto';
import { UpdateUniversiteDto } from './dto/update-universite.dto';
import { UpdateMyUniversiteDto } from './dto/update-my-universite.dto';
import { QueryUniversiteDto } from './dto/query-universite.dto';

type AuthUser = { id: string; role: Role; estGestionnaireEtablissement: boolean };

@ApiTags('universites')
@Controller()
export class UniversitesController {
  constructor(private universitesService: UniversitesService) {}

  @Public()
  @Get('universites')
  findAll(@Query() query: QueryUniversiteDto) {
    return this.universitesService.findAll(query);
  }

  @ApiBearerAuth()
  @Get('universites/mes-etablissements')
  findMine(@CurrentUser() user: AuthUser) {
    return this.universitesService.findMine(user.id);
  }

  @Public()
  @Get('universites/:slug')
  findOne(@Param('slug') slug: string) {
    return this.universitesService.findOne(slug);
  }

  @ApiBearerAuth()
  @Post('universites')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUniversiteDto) {
    return this.universitesService.create(user.id, user.role === Role.ADMIN, user.estGestionnaireEtablissement, dto);
  }

  @ApiBearerAuth()
  @Patch('universites/mine/:id')
  updateMine(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateMyUniversiteDto) {
    return this.universitesService.updateMine(user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/universites')
  findAllAdmin(@Query() query: QueryUniversiteDto) {
    return this.universitesService.findAllAdmin(query);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('universites/:id')
  update(@Param('id') id: string, @Body() dto: UpdateUniversiteDto) {
    return this.universitesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('universites/:id')
  remove(@Param('id') id: string) {
    return this.universitesService.remove(id);
  }
}
