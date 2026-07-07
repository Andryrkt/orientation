import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateCentreFormationDto } from './dto/create-centre-formation.dto';
import { UpdateCentreFormationDto } from './dto/update-centre-formation.dto';
import { QueryCentreFormationDto } from './dto/query-centre-formation.dto';

@Injectable()
export class CentresFormationService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCentreFormationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CentreFormationWhereInput = {
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.ville && { ville: { equals: query.ville, mode: 'insensitive' } }),
      ...(query.q && { nom: { contains: query.q, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.centreFormation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.centreFormation.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const centre = await this.prisma.centreFormation.findUnique({ where: { slug } });
    if (!centre) throw new NotFoundException('Centre de formation introuvable');
    return centre;
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.centreFormation.findFirst({
        where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined },
      })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(dto: CreateCentreFormationDto) {
    const slug = await this.uniqueSlug(dto.nom);
    return this.prisma.centreFormation.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateCentreFormationDto) {
    const existing = await this.prisma.centreFormation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Centre de formation introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    return this.prisma.centreFormation.update({
      where: { id },
      data: { ...dto, ...(slug && { slug }) },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.centreFormation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Centre de formation introuvable');
    await this.prisma.centreFormation.delete({ where: { id } });
    return { message: 'Centre de formation supprime' };
  }

  countAll() {
    return this.prisma.centreFormation.count();
  }
}
