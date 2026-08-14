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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('users/me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.usersService.findMe(user.id);
  }

  @Get('users/me/cv-suggestion')
  getCvSuggestion(@CurrentUser() user: { id: string }) {
    return this.usersService.getCvSuggestion(user.id);
  }

  @Patch('users/me')
  updateMe(@CurrentUser() user: { id: string; role: Role }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(user.id, user.role, dto);
  }

  @Patch('users/me/password')
  changePassword(@CurrentUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  // Lecture ouverte au modérateur finance : les pages Stands et Étudiants du back-office finance
  // s'en servent pour peupler la liste des secrétaires (aucune donnée sensible, cf. userSelect).
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATEUR_FINANCE)
  @Get('admin/users')
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query.page ?? 1, query.limit ?? 20);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/users')
  createEmploye(@Body() dto: CreateEmployeDto) {
    return this.usersService.createEmploye(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/users/:id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/users/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
