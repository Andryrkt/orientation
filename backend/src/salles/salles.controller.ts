import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SallesService } from './salles.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';

@ApiTags('salles')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
@Controller('admin/salles')
export class SallesController {
  constructor(private sallesService: SallesService) {}

  @Get()
  findAll() {
    return this.sallesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateSalleDto) {
    return this.sallesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSalleDto) {
    return this.sallesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sallesService.remove(id);
  }
}
