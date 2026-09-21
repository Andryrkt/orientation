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
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SecteursService } from './secteurs.service';
import { CreateSecteurDto } from './dto/create-secteur.dto';
import { UpdateSecteurDto } from './dto/update-secteur.dto';

@ApiTags('secteurs')
@Controller('secteurs')
export class SecteursController {
  constructor(private secteursService: SecteursService) {}

  @Public()
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.secteursService.findAll(query.page ?? 1, query.limit ?? 20);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.secteursService.findOne(slug);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateSecteurDto) {
    return this.secteursService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSecteurDto) {
    return this.secteursService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.secteursService.remove(id);
  }
}
