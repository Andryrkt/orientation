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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { EnseignantsService } from './enseignants.service';
import { CreateEnseignantDto } from './dto/create-enseignant.dto';
import { UpdateEnseignantDto } from './dto/update-enseignant.dto';
import { QueryEnseignantDto } from './dto/query-enseignant.dto';
import { CreateAvisDto } from './dto/create-avis.dto';

@ApiTags('enseignants')
@Controller()
export class EnseignantsController {
  constructor(private enseignantsService: EnseignantsService) {}

  @Public()
  @Get('enseignants')
  findAllVisible(@Query() query: QueryEnseignantDto) {
    return this.enseignantsService.findAllVisible(query);
  }

  @Public()
  @Get('enseignants/:id')
  findOneVisible(@Param('id') id: string) {
    return this.enseignantsService.findOneVisible(id);
  }

  @ApiBearerAuth()
  @Post('enseignants/:id/avis')
  addAvis(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateAvisDto,
  ) {
    return this.enseignantsService.addAvis(id, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/enseignants')
  findAllAdmin(@Query() query: QueryEnseignantDto) {
    return this.enseignantsService.findAllAdmin(query);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('enseignants')
  create(@Body() dto: CreateEnseignantDto) {
    return this.enseignantsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('enseignants/:id')
  update(@Param('id') id: string, @Body() dto: UpdateEnseignantDto) {
    return this.enseignantsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('enseignants/:id')
  remove(@Param('id') id: string) {
    return this.enseignantsService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('enseignants/:enseignantId/avis/:avisId')
  removeAvis(@Param('enseignantId') enseignantId: string, @Param('avisId') avisId: string) {
    return this.enseignantsService.removeAvis(enseignantId, avisId);
  }
}
