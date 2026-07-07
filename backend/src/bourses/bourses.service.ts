import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBourseDto } from './dto/create-bourse.dto';
import { UpdateBourseDto } from './dto/update-bourse.dto';
import { QueryBourseDto } from './dto/query-bourse.dto';

@Injectable()
export class BoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryBourseDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.BourseWhereInput = {
      ...(query.domaine && { domaine: { slug: query.domaine } }),
      ...(query.pays && { pays: { equals: query.pays, mode: 'insensitive' } }),
      ...(query.niveauEtude && { niveauEtude: { contains: query.niveauEtude, mode: 'insensitive' } }),
      ...(query.actifs === 'true' && {
        OR: [{ dateLimite: null }, { dateLimite: { gte: new Date() } }],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.bourse.findMany({
        where,
        include: { domaine: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateLimite: 'asc' },
      }),
      this.prisma.bourse.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const bourse = await this.prisma.bourse.findUnique({ where: { id }, include: { domaine: true } });
    if (!bourse) throw new NotFoundException('Bourse introuvable');
    return bourse;
  }

  create(dto: CreateBourseDto) {
    return this.prisma.bourse.create({
      data: {
        ...dto,
        dateLimite: dto.dateLimite ? new Date(dto.dateLimite) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateBourseDto) {
    const existing = await this.prisma.bourse.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Bourse introuvable');
    return this.prisma.bourse.update({
      where: { id },
      data: {
        ...dto,
        dateLimite: dto.dateLimite ? new Date(dto.dateLimite) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.bourse.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Bourse introuvable');
    await this.prisma.bourse.delete({ where: { id } });
    return { message: 'Bourse supprimee' };
  }

  countAll() {
    return this.prisma.bourse.count();
  }
}
