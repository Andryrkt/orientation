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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { QueryCommentaireDto } from './dto/query-commentaire.dto';
import { UpdateCommentaireStatutDto } from './dto/update-commentaire-statut.dto';

@ApiTags('blogs')
@Controller()
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Public()
  @Get('blogs')
  findAllPublished(@Query() query: QueryBlogDto) {
    return this.blogsService.findAllPublished(query);
  }

  @Public()
  @Get('blogs/:slug')
  findOnePublished(@Param('slug') slug: string) {
    return this.blogsService.findOnePublished(slug);
  }

  @ApiBearerAuth()
  @Get('blogs/:id/like-status')
  likeStatus(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.blogsService.likeStatus(id, user.id);
  }

  @ApiBearerAuth()
  @Post('blogs/:id/like')
  toggleLike(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.blogsService.toggleLike(id, user.id);
  }

  @ApiBearerAuth()
  @Post('blogs/:id/comments')
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCommentaireDto,
  ) {
    return this.blogsService.addComment(id, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('blogs')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateBlogDto) {
    return this.blogsService.create(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/blogs')
  findAllAdmin(@Query() query: QueryBlogDto) {
    return this.blogsService.findAllAdmin(query);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/blogs/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.blogsService.findOneAdmin(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('blogs/:id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('blogs/:id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/blog-commentaires')
  listCommentsForModeration(@Query() query: QueryCommentaireDto) {
    return this.blogsService.listCommentsForModeration(query);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/blog-commentaires/:id')
  moderateComment(@Param('id') id: string, @Body() dto: UpdateCommentaireStatutDto) {
    return this.blogsService.moderateComment(id, dto.statut);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/blog-commentaires/:id')
  removeComment(@Param('id') id: string) {
    return this.blogsService.removeComment(id);
  }
}
