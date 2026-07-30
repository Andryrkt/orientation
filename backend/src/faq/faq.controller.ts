import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { FaqService } from './faq.service';
import { CreateFaqItemDto } from './dto/create-faq-item.dto';
import { UpdateFaqItemDto } from './dto/update-faq-item.dto';

@ApiTags('faq')
@Controller()
export class FaqController {
  constructor(private faqService: FaqService) {}

  /** Endpoint public : retourne les FAQ publiées groupées par catégorie */
  @Public()
  @Get('faq')
  findAllPublished() {
    return this.faqService.findAllPublished();
  }

  /** Endpoint admin : liste brute de tous les items (publiés ou non) */
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/faq')
  findAllAdmin() {
    return this.faqService.findAllAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/faq/:id')
  findOne(@Param('id') id: string) {
    return this.faqService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/faq')
  create(@Body() dto: CreateFaqItemDto) {
    return this.faqService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/faq/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFaqItemDto) {
    return this.faqService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/faq/:id')
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}
