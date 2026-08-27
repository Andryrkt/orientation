import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { QueryFormationDto } from './dto/query-formation.dto';

@Injectable()
export class FormationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryFormationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.FormationWhereInput = {
      ...(query.centreId && { centreId: query.centreId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.formation.findMany({
        where,
        include: { centre: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.formation.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async create(dto: CreateFormationDto) {
    return this.prisma.formation.create({ data: dto });
  }

  async update(id: string, dto: UpdateFormationDto) {
    const existing = await this.prisma.formation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Formation introuvable');
    return this.prisma.formation.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.prisma.formation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Formation introuvable');
    await this.prisma.formation.delete({ where: { id } });
    return { message: 'Formation supprimee' };
  }

  countAll() {
    return this.prisma.formation.count();
  }
}
