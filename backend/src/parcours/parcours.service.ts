import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateParcoursDto } from './dto/create-parcours.dto';
import { UpdateParcoursDto } from './dto/update-parcours.dto';
import { QueryParcoursDto } from './dto/query-parcours.dto';

@Injectable()
export class ParcoursService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryParcoursDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ParcoursWhereInput = {
      ...(query.mention && { mention: { slug: query.mention } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.parcours.findMany({
        where,
        include: { mention: { include: { universite: true, domaine: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.parcours.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const parcours = await this.prisma.parcours.findUnique({
      where: { slug },
      include: { mention: { include: { universite: true, domaine: true } } },
    });
    if (!parcours) throw new NotFoundException('Parcours introuvable');
    return parcours;
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.parcours.findFirst({ where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined } })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(dto: CreateParcoursDto) {
    const slug = await this.uniqueSlug(dto.nom);
    return this.prisma.parcours.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateParcoursDto) {
    const existing = await this.prisma.parcours.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Parcours introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    return this.prisma.parcours.update({ where: { id }, data: { ...dto, ...(slug && { slug }) } });
  }

  async remove(id: string) {
    const existing = await this.prisma.parcours.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Parcours introuvable');
    await this.prisma.parcours.delete({ where: { id } });
    return { message: 'Parcours supprime' };
  }

  countAll() {
    return this.prisma.parcours.count();
  }
}
