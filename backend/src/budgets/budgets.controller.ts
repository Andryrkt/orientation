import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BudgetsService } from './budgets.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';
import { DupliquerBudgetDto } from './dto/dupliquer-budget.dto';
import { UpsertBudgetDetailDto } from './dto/upsert-budget-detail.dto';
import { dateDuJourMadagascar } from '../common/utils/date.util';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
@Controller('admin/budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  findAllAdmin(@Query('annee') annee?: string, @Query('mois') mois?: string) {
    const aujourdhui = dateDuJourMadagascar();
    const anneeResolue = annee ? Number(annee) : aujourdhui.getUTCFullYear();
    const moisResolu = mois ? Number(mois) : aujourdhui.getUTCMonth() + 1;
    return this.budgetsService.findAllAdmin(anneeResolue, moisResolu);
  }

  @Get('categories')
  categoriesConnues() {
    return this.budgetsService.categoriesConnues();
  }

  @Post()
  upsert(@Body() dto: UpsertBudgetDto) {
    return this.budgetsService.upsert(dto);
  }

  @Post('dupliquer')
  dupliquer(@Body() dto: DupliquerBudgetDto) {
    return this.budgetsService.dupliquerDepuis(dto.anneeSource, dto.moisSource, dto.anneeCible, dto.moisCible);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }

  @Get('detail')
  detailsAdmin(@Query('categorie') categorie: string, @Query('annee') annee: string, @Query('mois') mois: string) {
    return this.budgetsService.detailsAdmin(categorie, Number(annee), Number(mois));
  }

  @Post('detail')
  upsertDetail(@Body() dto: UpsertBudgetDetailDto) {
    return this.budgetsService.upsertDetail(dto);
  }

  @Patch('detail/:id')
  updateDetail(@Param('id') id: string, @Body() dto: UpsertBudgetDetailDto) {
    return this.budgetsService.updateDetail(id, dto);
  }

  @Delete('detail/:id')
  removeDetail(@Param('id') id: string) {
    return this.budgetsService.removeDetail(id);
  }
}
