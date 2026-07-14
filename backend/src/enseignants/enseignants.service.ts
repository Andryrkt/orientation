import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnseignantDto } from './dto/create-enseignant.dto';
import { UpdateEnseignantDto } from './dto/update-enseignant.dto';
import { QueryEnseignantDto } from './dto/query-enseignant.dto';
import { CreateAvisDto } from './dto/create-avis.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true } };

function withNoteMoyenne<T extends { avis: { note: number }[] }>(enseignant: T) {
  const { avis, ...rest } = enseignant;
  const noteMoyenne = avis.length ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length : null;
  return { ...rest, noteMoyenne, avisCount: avis.length };
}

@Injectable()
export class EnseignantsService {
  constructor(private prisma: PrismaService) {}

  async findAllVisible(query: QueryEnseignantDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.EnseignantWhereInput = {
      visible: true,
      ...(query.matiere && { matieres: { has: query.matiere } }),
      ...(query.q && {
        OR: [
          { nom: { contains: query.q, mode: 'insensitive' } },
          { prenom: { contains: query.q, mode: 'insensitive' } },
          { etablissement: { contains: query.q, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.enseignant.findMany({
        where,
        include: { avis: { select: { note: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enseignant.count({ where }),
    ]);
    return { items: items.map(withNoteMoyenne), total, page, limit };
  }

  async findOneVisible(id: string) {
    const enseignant = await this.prisma.enseignant.findUnique({
      where: { id },
      include: {
        avis: { include: { utilisateur: AUTEUR_SELECT }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!enseignant || !enseignant.visible) throw new NotFoundException('Enseignant introuvable');
    return withNoteMoyenne(enseignant);
  }

  async findAllAdmin(query: QueryEnseignantDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.prisma.enseignant.findMany({
        include: { avis: { select: { note: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enseignant.count(),
    ]);
    return { items: items.map(withNoteMoyenne), total, page, limit };
  }

  create(dto: CreateEnseignantDto) {
    return this.prisma.enseignant.create({ data: dto });
  }

  async update(id: string, dto: UpdateEnseignantDto) {
    const existing = await this.prisma.enseignant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Enseignant introuvable');
    return this.prisma.enseignant.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.prisma.enseignant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Enseignant introuvable');
    await this.prisma.enseignant.delete({ where: { id } });
    return { message: 'Enseignant supprime' };
  }

  async addAvis(enseignantId: string, userId: string, dto: CreateAvisDto) {
    const enseignant = await this.prisma.enseignant.findUnique({ where: { id: enseignantId } });
    if (!enseignant) throw new NotFoundException('Enseignant introuvable');
    return this.prisma.enseignantAvis.upsert({
      where: { enseignantId_utilisateurId: { enseignantId, utilisateurId: userId } },
      update: { note: dto.note, commentaire: dto.commentaire },
      create: { enseignantId, utilisateurId: userId, note: dto.note, commentaire: dto.commentaire },
    });
  }

  async removeAvis(enseignantId: string, avisId: string) {
    const avis = await this.prisma.enseignantAvis.findUnique({ where: { id: avisId } });
    if (!avis || avis.enseignantId !== enseignantId) throw new NotFoundException('Avis introuvable');
    await this.prisma.enseignantAvis.delete({ where: { id: avisId } });
    return { message: 'Avis supprime' };
  }
}
