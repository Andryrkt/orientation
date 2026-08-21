import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RendezVousService } from './rendez-vous.service';
import { CreateRendezVousDto } from './dto/create-rendez-vous.dto';
import { UpdateRendezVousDto } from './dto/update-rendez-vous.dto';
import { QueryRendezVousDto } from './dto/query-rendez-vous.dto';

@ApiTags('rendez-vous')
@ApiBearerAuth()
@Controller()
export class RendezVousController {
  constructor(private rendezVousService: RendezVousService) {}

  @Post('rendez-vous')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateRendezVousDto) {
    return this.rendezVousService.create(user.id, dto);
  }

  @Get('rendez-vous')
  findAll(@CurrentUser() user: { id: string; role: Role }, @Query() query: QueryRendezVousDto) {
    return this.rendezVousService.findAll(user.id, user.role, query);
  }

  @Patch('rendez-vous/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
    @Body() dto: UpdateRendezVousDto,
  ) {
    return this.rendezVousService.update(id, user.id, user.role, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR)
  @Get('admin/rendez-vous')
  findAllAdmin(@Query() query: QueryRendezVousDto) {
    return this.rendezVousService.findAllAdmin(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR)
  @Delete('rendez-vous/:id')
  remove(@Param('id') id: string) {
    return this.rendezVousService.remove(id);
  }
}
