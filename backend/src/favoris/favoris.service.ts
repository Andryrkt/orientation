import { Injectable, NotFoundException } from '@nestjs/common';
import { FavorisableType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriDto } from './dto/create-favori.dto';

@Injectable()
export class FavorisService {
  constructor(private prisma: PrismaService) {}

  private async findEntity(type: FavorisableType, entityId: string) {
    switch (type) {
      case FavorisableType.METIER:
        return this.prisma.metier.findUnique({
          where: { id: entityId },
          select: { id: true, nom: true, slug: true },
        });
      case FavorisableType.UNIVERSITE:
        return this.prisma.universite.findUnique({
          where: { id: entityId },
          select: { id: true, nom: true, slug: true },
        });
      case FavorisableType.STAGE: {
        const stage = await this.prisma.stage.findUnique({
          where: { id: entityId },
          select: { id: true, titre: true },
        });
        return stage && { id: stage.id, nom: stage.titre, slug: stage.id };
      }
      case FavorisableType.BOURSE: {
        const bourse = await this.prisma.bourse.findUnique({
          where: { id: entityId },
          select: { id: true, nom: true },
        });
        return bourse && { id: bourse.id, nom: bourse.nom, slug: bourse.id };
      }
      case FavorisableType.COACH: {
        const coach = await this.prisma.coach.findUnique({
          where: { id: entityId },
          select: { id: true, nom: true, prenom: true },
        });
        return coach && { id: coach.id, nom: `${coach.prenom} ${coach.nom}`, slug: coach.id };
      }
    }
  }

  async findAllForUser(userId: string, type?: FavorisableType) {
    const favoris = await this.prisma.favori.findMany({
      where: { utilisateurId: userId, ...(type && { type }) },
      orderBy: { createdAt: 'desc' },
    });

    const entities = await Promise.all(
      favoris.map((f) => this.findEntity(f.type, f.entityId)),
    );

    return favoris.map((f, i) => ({ ...f, entity: entities[i] }));
  }

  async create(userId: string, dto: CreateFavoriDto) {
    const entity = await this.findEntity(dto.type, dto.entityId);
    if (!entity) {
      throw new NotFoundException("L'élément à ajouter en favori est introuvable");
    }

    const existing = await this.prisma.favori.findUnique({
      where: {
        utilisateurId_type_entityId: {
          utilisateurId: userId,
          type: dto.type,
          entityId: dto.entityId,
        },
      },
    });
    if (existing) {
      return { ...existing, entity };
    }

    const favori = await this.prisma.favori.create({
      data: { utilisateurId: userId, type: dto.type, entityId: dto.entityId },
    });
    return { ...favori, entity };
  }

  async remove(userId: string, id: string) {
    const favori = await this.prisma.favori.findUnique({ where: { id } });
    if (!favori || favori.utilisateurId !== userId) {
      throw new NotFoundException('Favori introuvable');
    }
    await this.prisma.favori.delete({ where: { id } });
    return { message: 'Favori supprime' };
  }
}
