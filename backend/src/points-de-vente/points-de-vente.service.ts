import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePointDeVenteDto } from './dto/create-point-de-vente.dto';
import { UpdatePointDeVenteDto } from './dto/update-point-de-vente.dto';

const SECRETAIRE_SELECT = {
  id: true,
  nom: true,
  prenom: true,
  email: true,
  telephone: true,
};

@Injectable()
export class PointsDeVenteService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePointDeVenteDto) {
    return this.prisma.pointDeVente.create({ data: dto });
  }

  async findAllAdmin() {
    const items = await this.prisma.pointDeVente.findMany({
      orderBy: { createdAt: 'desc' },
      include: { secretaires: { select: SECRETAIRE_SELECT } },
    });
    return { items, total: items.length, page: 1, limit: items.length || 100 };
  }

  async findOne(id: string) {
    const item = await this.prisma.pointDeVente.findUnique({
      where: { id },
      include: { secretaires: { select: SECRETAIRE_SELECT } },
    });
    if (!item) throw new NotFoundException(`Point de vente #${id} introuvable`);
    return item;
  }

  async update(id: string, dto: UpdatePointDeVenteDto) {
    await this.findOne(id);
    return this.prisma.pointDeVente.update({ where: { id }, data: dto });
  }

  async setActif(id: string, actif: boolean) {
    await this.findOne(id);
    return this.prisma.pointDeVente.update({ where: { id }, data: { actif } });
  }

  async assignSecretaire(id: string, utilisateurId: string) {
    await this.findOne(id);
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) throw new NotFoundException(`Utilisateur #${utilisateurId} introuvable`);
    if (utilisateur.role !== Role.SECRETAIRE) {
      throw new BadRequestException(
        "Cet utilisateur doit d'abord avoir le rôle SECRETAIRE avant d'être assigné à un point de vente",
      );
    }
    await this.prisma.utilisateur.update({ where: { id: utilisateurId }, data: { pointDeVenteId: id } });
    return this.findOne(id);
  }

  async unassignSecretaire(id: string, utilisateurId: string) {
    await this.findOne(id);
    const utilisateur = await this.prisma.utilisateur.findFirst({ where: { id: utilisateurId, pointDeVenteId: id } });
    if (!utilisateur) throw new NotFoundException(`Secrétaire #${utilisateurId} introuvable pour ce point de vente`);
    await this.prisma.utilisateur.update({ where: { id: utilisateurId }, data: { pointDeVenteId: null } });
    return this.findOne(id);
  }

  async findMine(utilisateurId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      include: { pointDeVente: true },
    });
    return utilisateur?.pointDeVente ?? null;
  }

  async findAllActifsAvecSecretaires() {
    return this.prisma.pointDeVente.findMany({
      where: { actif: true },
      include: { secretaires: { select: SECRETAIRE_SELECT } },
    });
  }
}
