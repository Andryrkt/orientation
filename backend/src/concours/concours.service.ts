import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConcoursDto } from './dto/create-concours.dto';
import { UpdateConcoursDto } from './dto/update-concours.dto';
import { QueryConcoursDto } from './dto/query-concours.dto';

@Injectable()
export class ConcoursService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryConcoursDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ConcoursWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.domaine && { domaine: { slug: query.domaine } }),
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.niveauRequis && { niveauRequis: { contains: query.niveauRequis, mode: 'insensitive' } }),
      ...(query.actifs === 'true' && {
        OR: [{ dateLimiteInscription: null }, { dateLimiteInscription: { gte: new Date() } }],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.concours.findMany({
        where,
        include: { domaine: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.concours.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const concours = await this.prisma.concours.findUnique({
      where: { id },
      include: { domaine: true },
    });
    if (!concours) throw new NotFoundException('Concours introuvable');
    return concours;
  }

  create(dto: CreateConcoursDto) {
    return this.prisma.concours.create({
      data: {
        ...dto,
        dateConcours: dto.dateConcours ? new Date(dto.dateConcours) : undefined,
        dateLimiteInscription: dto.dateLimiteInscription ? new Date(dto.dateLimiteInscription) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateConcoursDto) {
    const existing = await this.prisma.concours.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Concours introuvable');
    return this.prisma.concours.update({
      where: { id },
      data: {
        ...dto,
        dateConcours: dto.dateConcours ? new Date(dto.dateConcours) : undefined,
        dateLimiteInscription: dto.dateLimiteInscription ? new Date(dto.dateLimiteInscription) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.concours.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Concours introuvable');
    await this.prisma.concours.delete({ where: { id } });
    return { message: 'Concours supprime' };
  }

  countAll() {
    return this.prisma.concours.count();
  }
}
