import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmploiDto } from './dto/create-emploi.dto';
import { UpdateEmploiDto } from './dto/update-emploi.dto';
import { QueryEmploiDto } from './dto/query-emploi.dto';

@Injectable()
export class EmploisService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryEmploiDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.EmploiWhereInput = {
      ...(query.domaine && { domaine: { slug: query.domaine } }),
      ...(query.secteur && { secteur: { slug: query.secteur } }),
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.typeContrat && { typeContrat: { contains: query.typeContrat, mode: 'insensitive' } }),
      ...(query.niveauEtude && { niveauEtude: { contains: query.niveauEtude, mode: 'insensitive' } }),
      ...(query.actifs === 'true' && {
        OR: [{ dateLimiteCandidature: null }, { dateLimiteCandidature: { gte: new Date() } }],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.emploi.findMany({
        where,
        include: { domaine: true, secteur: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.emploi.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const emploi = await this.prisma.emploi.findUnique({
      where: { id },
      include: { domaine: true, secteur: true },
    });
    if (!emploi) throw new NotFoundException('Offre d\'emploi introuvable');
    return emploi;
  }

  create(dto: CreateEmploiDto) {
    return this.prisma.emploi.create({
      data: {
        ...dto,
        dateLimiteCandidature: dto.dateLimiteCandidature ? new Date(dto.dateLimiteCandidature) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateEmploiDto) {
    const existing = await this.prisma.emploi.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Offre d\'emploi introuvable');
    return this.prisma.emploi.update({
      where: { id },
      data: {
        ...dto,
        dateLimiteCandidature: dto.dateLimiteCandidature ? new Date(dto.dateLimiteCandidature) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.emploi.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Offre d\'emploi introuvable');
    await this.prisma.emploi.delete({ where: { id } });
    return { message: 'Offre d\'emploi supprimee' };
  }

  countAll() {
    return this.prisma.emploi.count();
  }
}
