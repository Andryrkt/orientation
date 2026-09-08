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
import { CentresFormationService } from './centres-formation.service';
import { CreateCentreFormationDto } from './dto/create-centre-formation.dto';
import { UpdateCentreFormationDto } from './dto/update-centre-formation.dto';
import { UpdateMyCentreFormationDto } from './dto/update-my-centre-formation.dto';
import { QueryCentreFormationDto } from './dto/query-centre-formation.dto';

type AuthUser = { id: string; role: Role; estGestionnaireEtablissement: boolean };

@ApiTags('centres-formation')
@Controller()
export class CentresFormationController {
  constructor(private centresFormationService: CentresFormationService) {}

  @Public()
  @Get('centres-formation')
  findAll(@Query() query: QueryCentreFormationDto) {
    return this.centresFormationService.findAll(query);
  }

  @ApiBearerAuth()
  @Get('centres-formation/mes-etablissements')
  findMine(@CurrentUser() user: AuthUser) {
    return this.centresFormationService.findMine(user.id);
  }

  @Public()
  @Get('centres-formation/:slug')
  findOne(@Param('slug') slug: string) {
    return this.centresFormationService.findOne(slug);
  }

  @ApiBearerAuth()
  @Post('centres-formation')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCentreFormationDto) {
    return this.centresFormationService.create(user.id, user.role === Role.ADMIN, user.estGestionnaireEtablissement, dto);
  }

  @ApiBearerAuth()
  @Patch('centres-formation/mine/:id')
  updateMine(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateMyCentreFormationDto) {
    return this.centresFormationService.updateMine(user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/centres-formation')
  findAllAdmin(@Query() query: QueryCentreFormationDto) {
    return this.centresFormationService.findAllAdmin(query);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('centres-formation/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCentreFormationDto) {
    return this.centresFormationService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('centres-formation/:id')
  remove(@Param('id') id: string) {
    return this.centresFormationService.remove(id);
  }
}
