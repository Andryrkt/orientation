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
import { EmploisService } from './emplois.service';
import { CreateEmploiDto } from './dto/create-emploi.dto';
import { UpdateEmploiDto } from './dto/update-emploi.dto';
import { QueryEmploiDto } from './dto/query-emploi.dto';

@ApiTags('emplois')
@Controller('emplois')
export class EmploisController {
  constructor(private emploisService: EmploisService) {}

  @Public()
  @Get()
  findAll(@Query() query: QueryEmploiDto) {
    return this.emploisService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emploisService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateEmploiDto) {
    return this.emploisService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmploiDto) {
    return this.emploisService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emploisService.remove(id);
  }
}
