import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { DepensesGlobalesService } from './depenses-globales.service';
import { CreateDepenseGlobaleDto } from './dto/create-depense-globale.dto';
import { UpdateDepenseGlobaleDto } from './dto/update-depense-globale.dto';

@ApiTags('depenses-globales')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller()
export class DepensesGlobalesController {
  constructor(private depensesGlobalesService: DepensesGlobalesService) {}

  @Post('admin/depenses-globales')
  create(@Body() dto: CreateDepenseGlobaleDto) {
    return this.depensesGlobalesService.create(dto);
  }

  @Get('admin/depenses-globales')
  findAllAdmin(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.depensesGlobalesService.findAllAdmin({ dateFrom, dateTo });
  }

  @Get('admin/depenses-globales/total')
  total(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.depensesGlobalesService.total({ dateFrom, dateTo });
  }

  @Get('admin/depenses-globales/:id')
  findOne(@Param('id') id: string) {
    return this.depensesGlobalesService.findOne(id);
  }

  @Patch('admin/depenses-globales/:id')
  update(@Param('id') id: string, @Body() dto: UpdateDepenseGlobaleDto) {
    return this.depensesGlobalesService.update(id, dto);
  }

  @Delete('admin/depenses-globales/:id')
  remove(@Param('id') id: string) {
    return this.depensesGlobalesService.remove(id);
  }
}
