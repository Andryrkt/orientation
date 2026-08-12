import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { InvestissementsService } from './investissements.service';
import { CreateInvestissementDto } from './dto/create-investissement.dto';
import { UpdateInvestissementDto } from './dto/update-investissement.dto';

@ApiTags('investissements')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
@Controller()
export class InvestissementsController {
  constructor(private investissementsService: InvestissementsService) {}

  @Post('admin/investissements')
  create(@Body() dto: CreateInvestissementDto) {
    return this.investissementsService.create(dto);
  }

  @Get('admin/investissements')
  findAllAdmin(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.investissementsService.findAllAdmin({ dateFrom, dateTo });
  }

  @Get('admin/investissements/total')
  total(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.investissementsService.total({ dateFrom, dateTo });
  }

  @Get('admin/investissements/:id')
  findOne(@Param('id') id: string) {
    return this.investissementsService.findOne(id);
  }

  @Patch('admin/investissements/:id')
  update(@Param('id') id: string, @Body() dto: UpdateInvestissementDto) {
    return this.investissementsService.update(id, dto);
  }

  @Delete('admin/investissements/:id')
  remove(@Param('id') id: string) {
    return this.investissementsService.remove(id);
  }
}
