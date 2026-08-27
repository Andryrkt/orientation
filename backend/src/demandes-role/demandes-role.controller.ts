import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { DemandesRoleService } from './demandes-role.service';
import { CreateDemandeRoleDto } from './dto/create-demande-role.dto';
import { UpdateDemandeRoleDto } from './dto/update-demande-role.dto';
import { ResubmitDemandeRoleDto } from './dto/resubmit-demande-role.dto';
import { QueryDemandeRoleDto } from './dto/query-demande-role.dto';

@ApiTags('demandes-role')
@ApiBearerAuth()
@Controller()
export class DemandesRoleController {
  constructor(private demandesRoleService: DemandesRoleService) {}

  @Post('demandes-role')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateDemandeRoleDto) {
    return this.demandesRoleService.create(user.id, dto);
  }

  @Get('demandes-role/mes-demandes')
  findMine(@CurrentUser() user: { id: string }) {
    return this.demandesRoleService.findMine(user.id);
  }

  @Patch('demandes-role/:id')
  updateMine(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: ResubmitDemandeRoleDto) {
    return this.demandesRoleService.updateMine(user.id, id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/demandes-role')
  findAllAdmin(@Query() query: QueryDemandeRoleDto) {
    return this.demandesRoleService.findAllAdmin(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/demandes-role/:id')
  resolve(@Param('id') id: string, @Body() dto: UpdateDemandeRoleDto) {
    return this.demandesRoleService.resolve(id, dto);
  }
}
