import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';

@ApiTags('contact')
@Controller()
export class ContactController {
  constructor(private contactService: ContactService) {}

  /** Endpoint public : envoi du formulaire de contact */
  @Public()
  @Post('contact')
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/contact')
  findAllAdmin() {
    return this.contactService.findAllAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/contact/:id')
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/contact/:id')
  update(@Param('id') id: string, @Body() dto: UpdateContactMessageDto) {
    return this.contactService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/contact/:id')
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
