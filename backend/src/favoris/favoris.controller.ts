import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FavorisService } from './favoris.service';
import { CreateFavoriDto } from './dto/create-favori.dto';
import { QueryFavoriDto } from './dto/query-favori.dto';

@ApiBearerAuth()
@ApiTags('favoris')
@Controller('favoris')
export class FavorisController {
  constructor(private favorisService: FavorisService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }, @Query() query: QueryFavoriDto) {
    return this.favorisService.findAllForUser(user.id, query.type);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateFavoriDto) {
    return this.favorisService.create(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.favorisService.remove(user.id, id);
  }
}
