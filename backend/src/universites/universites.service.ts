import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateUniversiteDto } from './dto/create-universite.dto';
import { UpdateUniversiteDto } from './dto/update-universite.dto';
import { QueryUniversiteDto } from './dto/query-universite.dto';

@Injectable()
export class UniversitesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryUniversiteDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UniversiteWhereInput = {
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.ville && { ville: { equals: query.ville, mode: 'insensitive' } }),
      ...(query.q && { nom: { contains: query.q, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.universite.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.universite.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const universite = await this.prisma.universite.findUnique({
      where: { slug },
      include: { mentions: { include: { parcours: true, domaine: true } } },
    });
    if (!universite) throw new NotFoundException('Universite introuvable');
    return universite;
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.universite.findFirst({
        where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined },
      })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(dto: CreateUniversiteDto) {
    const slug = await this.uniqueSlug(dto.nom);
    const { photos, ...rest } = dto;
    return this.prisma.universite.create({ data: { ...rest, slug, photos: photos ?? [] } });
  }

  async update(id: string, dto: UpdateUniversiteDto) {
    const existing = await this.prisma.universite.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Universite introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    const { photos, ...rest } = dto;
    return this.prisma.universite.update({
      where: { id },
      data: { ...rest, ...(slug && { slug }), ...(photos && { photos }) },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.universite.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Universite introuvable');
    await this.prisma.universite.delete({ where: { id } });
    return { message: 'Universite et ses mentions/parcours associes supprimes' };
  }

  countAll() {
    return this.prisma.universite.count();
  }
}
