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
import { CoachsService } from './coachs.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { QueryCoachDto } from './dto/query-coach.dto';
import { CreateAvisDto } from './dto/create-avis.dto';

@ApiTags('coachs')
@Controller()
export class CoachsController {
  constructor(private coachsService: CoachsService) {}

  @Public()
  @Get('coachs')
  findAllVisible(@Query() query: QueryCoachDto) {
    return this.coachsService.findAllVisible(query);
  }

  @Public()
  @Get('coachs/:id')
  findOneVisible(@Param('id') id: string) {
    return this.coachsService.findOneVisible(id);
  }

  @ApiBearerAuth()
  @Post('coachs/:id/avis')
  addAvis(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateAvisDto,
  ) {
    return this.coachsService.addAvis(id, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/coachs')
  findAllAdmin(@Query() query: QueryCoachDto) {
    return this.coachsService.findAllAdmin(query);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('coachs')
  create(@Body() dto: CreateCoachDto) {
    return this.coachsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('coachs/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCoachDto) {
    return this.coachsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('coachs/:id')
  remove(@Param('id') id: string) {
    return this.coachsService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('coachs/:coachId/avis/:avisId')
  removeAvis(@Param('coachId') coachId: string, @Param('avisId') avisId: string) {
    return this.coachsService.removeAvis(coachId, avisId);
  }
}
