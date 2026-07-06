import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateMentionDto } from './dto/create-mention.dto';
import { UpdateMentionDto } from './dto/update-mention.dto';
import { QueryMentionDto } from './dto/query-mention.dto';

@Injectable()
export class MentionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryMentionDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.MentionWhereInput = {
      ...(query.universite && { universite: { slug: query.universite } }),
      ...(query.domaine && { domaine: { slug: query.domaine } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.mention.findMany({
        where,
        include: { universite: true, domaine: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.mention.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const mention = await this.prisma.mention.findUnique({
      where: { slug },
      include: { universite: true, domaine: true, parcours: true },
    });
    if (!mention) throw new NotFoundException('Mention introuvable');
    return mention;
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.mention.findFirst({ where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined } })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(dto: CreateMentionDto) {
    const slug = await this.uniqueSlug(dto.nom);
    return this.prisma.mention.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateMentionDto) {
    const existing = await this.prisma.mention.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Mention introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    return this.prisma.mention.update({ where: { id }, data: { ...dto, ...(slug && { slug }) } });
  }

  async remove(id: string) {
    const existing = await this.prisma.mention.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Mention introuvable');
    await this.prisma.mention.delete({ where: { id } });
    return { message: 'Mention et ses parcours associes supprimes' };
  }

  countAll() {
    return this.prisma.mention.count();
  }
}
