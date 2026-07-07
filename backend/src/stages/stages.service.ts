import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryStageDto } from './dto/query-stage.dto';

@Injectable()
export class StagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryStageDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.StageWhereInput = {
      ...(query.domaine && { domaine: { slug: query.domaine } }),
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.niveauEtude && { niveauEtude: { contains: query.niveauEtude, mode: 'insensitive' } }),
      ...(query.actifs === 'true' && {
        OR: [{ dateLimiteCandidature: null }, { dateLimiteCandidature: { gte: new Date() } }],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.stage.findMany({
        where,
        include: { domaine: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateLimiteCandidature: 'asc' },
      }),
      this.prisma.stage.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const stage = await this.prisma.stage.findUnique({ where: { id }, include: { domaine: true } });
    if (!stage) throw new NotFoundException('Stage introuvable');
    return stage;
  }

  create(dto: CreateStageDto) {
    return this.prisma.stage.create({
      data: {
        ...dto,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
        dateLimiteCandidature: dto.dateLimiteCandidature ? new Date(dto.dateLimiteCandidature) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateStageDto) {
    const existing = await this.prisma.stage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Stage introuvable');
    return this.prisma.stage.update({
      where: { id },
      data: {
        ...dto,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
        dateLimiteCandidature: dto.dateLimiteCandidature ? new Date(dto.dateLimiteCandidature) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.stage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Stage introuvable');
    await this.prisma.stage.delete({ where: { id } });
    return { message: 'Stage supprime' };
  }

  countAll() {
    return this.prisma.stage.count();
  }
}
