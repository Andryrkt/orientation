import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentaireStatut, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { QueryCommentaireDto } from './dto/query-commentaire.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true } };

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublished(query: QueryBlogDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.BlogWhereInput = {
      publishedAt: { lte: new Date() },
      ...(query.categorie && { categorie: { equals: query.categorie, mode: 'insensitive' } }),
      ...(query.q && { titre: { contains: query.q, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        include: { auteur: AUTEUR_SELECT, _count: { select: { likes: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.blog.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOnePublished(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        auteur: AUTEUR_SELECT,
        _count: { select: { likes: true } },
        commentaires: {
          where: { statut: CommentaireStatut.APPROUVE },
          include: { utilisateur: AUTEUR_SELECT },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!blog || !blog.publishedAt || blog.publishedAt > new Date()) {
      throw new NotFoundException('Article introuvable');
    }
    return blog;
  }

  async likeStatus(blogId: string, userId: string) {
    const like = await this.prisma.blogLike.findUnique({
      where: { blogId_utilisateurId: { blogId, utilisateurId: userId } },
    });
    return { liked: !!like };
  }

  async findAllAdmin(query: QueryBlogDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.BlogWhereInput = {
      ...(query.categorie && { categorie: { equals: query.categorie, mode: 'insensitive' } }),
      ...(query.q && { titre: { contains: query.q, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        include: { auteur: AUTEUR_SELECT, _count: { select: { likes: true, commentaires: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blog.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOneAdmin(id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id }, include: { auteur: AUTEUR_SELECT } });
    if (!blog) throw new NotFoundException('Article introuvable');
    return blog;
  }

  private async uniqueSlug(titre: string, ignoreId?: string) {
    const base = slugify(titre);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.blog.findFirst({ where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined } })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(auteurId: string, dto: CreateBlogDto) {
    const slug = await this.uniqueSlug(dto.titre);
    return this.prisma.blog.create({
      data: {
        ...dto,
        slug,
        auteurId,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateBlogDto) {
    const existing = await this.prisma.blog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Article introuvable');
    const slug = dto.titre ? await this.uniqueSlug(dto.titre, id) : undefined;
    return this.prisma.blog.update({
      where: { id },
      data: {
        ...dto,
        ...(slug && { slug }),
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.blog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Article introuvable');
    await this.prisma.blog.delete({ where: { id } });
    return { message: 'Article supprime' };
  }

  countAll() {
    return this.prisma.blog.count();
  }

  async toggleLike(blogId: string, userId: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Article introuvable');

    const existing = await this.prisma.blogLike.findUnique({
      where: { blogId_utilisateurId: { blogId, utilisateurId: userId } },
    });
    if (existing) {
      await this.prisma.blogLike.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.blogLike.create({ data: { blogId, utilisateurId: userId } });
    }
    const count = await this.prisma.blogLike.count({ where: { blogId } });
    return { liked: !existing, likesCount: count };
  }

  async addComment(blogId: string, userId: string, dto: CreateCommentaireDto) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Article introuvable');
    return this.prisma.blogCommentaire.create({
      data: { blogId, utilisateurId: userId, contenu: dto.contenu },
    });
  }

  async listCommentsForModeration(query: QueryCommentaireDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.BlogCommentaireWhereInput = { ...(query.statut && { statut: query.statut }) };

    const [items, total] = await Promise.all([
      this.prisma.blogCommentaire.findMany({
        where,
        include: { utilisateur: AUTEUR_SELECT, blog: { select: { id: true, titre: true, slug: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blogCommentaire.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async moderateComment(id: string, statut: CommentaireStatut) {
    const comment = await this.prisma.blogCommentaire.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Commentaire introuvable');
    return this.prisma.blogCommentaire.update({ where: { id }, data: { statut } });
  }

  async removeComment(id: string) {
    const comment = await this.prisma.blogCommentaire.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Commentaire introuvable');
    await this.prisma.blogCommentaire.delete({ where: { id } });
    return { message: 'Commentaire supprime' };
  }
}
