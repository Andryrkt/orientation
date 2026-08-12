import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { DroitInscriptionService } from './droit-inscription.service';
import { UpdateDroitInscriptionDto } from './dto/update-droit-inscription.dto';

@ApiTags('droit-inscription')
@ApiBearerAuth()
@Controller()
export class DroitInscriptionController {
  constructor(private droitInscriptionService: DroitInscriptionService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.SECRETAIRE, Role.ADMIN)
  @Get('droit-inscription')
  get() {
    return this.droitInscriptionService.get();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/droit-inscription')
  update(@Body() dto: UpdateDroitInscriptionDto) {
    return this.droitInscriptionService.update(dto);
  }
}
