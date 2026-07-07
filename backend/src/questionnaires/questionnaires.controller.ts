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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { QuestionnairesService } from './questionnaires.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateReponseDto } from './dto/create-reponse.dto';
import { UpdateReponseDto } from './dto/update-reponse.dto';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';

@ApiTags('questionnaires')
@Controller()
export class QuestionnairesController {
  constructor(private questionnairesService: QuestionnairesService) {}

  @Public()
  @Get('questionnaires')
  findAllActive() {
    return this.questionnairesService.findAllActive();
  }

  @Public()
  @Get('questionnaires/:id')
  findOneForTaking(@Param('id') id: string) {
    return this.questionnairesService.findOneForTaking(id);
  }

  @ApiBearerAuth()
  @Post('questionnaires/:id/soumettre')
  submit(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SubmitQuestionnaireDto,
  ) {
    return this.questionnairesService.submit(id, user.id, dto);
  }

  @ApiBearerAuth()
  @Get('resultats-orientation')
  findResultsForUser(@CurrentUser() user: { id: string }) {
    return this.questionnairesService.findResultsForUser(user.id);
  }

  @ApiBearerAuth()
  @Get('resultats-orientation/:id')
  findResultForUser(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.questionnairesService.findResultForUser(user.id, id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/questionnaires')
  findAllAdmin() {
    return this.questionnairesService.findAllAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/questionnaires/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.questionnairesService.findOneAdmin(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('questionnaires')
  create(@Body() dto: CreateQuestionnaireDto) {
    return this.questionnairesService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('questionnaires/:id')
  update(@Param('id') id: string, @Body() dto: UpdateQuestionnaireDto) {
    return this.questionnairesService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('questionnaires/:id')
  remove(@Param('id') id: string) {
    return this.questionnairesService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('questions')
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.questionnairesService.createQuestion(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionnairesService.updateQuestion(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('questions/:id')
  removeQuestion(@Param('id') id: string) {
    return this.questionnairesService.removeQuestion(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('reponses')
  createReponse(@Body() dto: CreateReponseDto) {
    return this.questionnairesService.createReponse(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('reponses/:id')
  updateReponse(@Param('id') id: string, @Body() dto: UpdateReponseDto) {
    return this.questionnairesService.updateReponse(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('reponses/:id')
  removeReponse(@Param('id') id: string) {
    return this.questionnairesService.removeReponse(id);
  }
}
