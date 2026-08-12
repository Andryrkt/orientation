import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';
import { CreateFiliereMontantDto } from './dto/create-filiere-montant.dto';

@Injectable()
export class FilieresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFiliereDto) {
    const filiere = await this.prisma.filiere.create({ data: dto });
    // Le prix initial constitue le premier montant actif de l'historique.
    await this.prisma.filiereMontant.create({
      data: { filiereId: filiere.id, montant: dto.prix, actif: true },
    });
    return filiere;
  }

  async findAllAdmin() {
    const items = await this.prisma.filiere.findMany({ orderBy: { nom: 'asc' } });
    return { items, total: items.length, page: 1, limit: items.length || 100 };
  }

  async findAllActives() {
    return this.prisma.filiere.findMany({ where: { actif: true }, orderBy: { nom: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.filiere.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Filière #${id} introuvable`);
    return item;
  }

  async update(id: string, dto: UpdateFiliereDto) {
    await this.findOne(id);
    return this.prisma.filiere.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inscriptions = await this.prisma.inscriptionFiliere.count({ where: { filiereId: id } });
    if (inscriptions > 0) {
      throw new BadRequestException(
        'Impossible de supprimer cette filière : des étudiants y sont déjà inscrits. Désactivez-la plutôt.',
      );
    }
    return this.prisma.filiere.delete({ where: { id } });
  }

  async findMontants(filiereId: string) {
    await this.findOne(filiereId);
    return this.prisma.filiereMontant.findMany({
      where: { filiereId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMontant(filiereId: string, dto: CreateFiliereMontantDto) {
    await this.findOne(filiereId);
    return this.prisma.$transaction(async (tx) => {
      if (dto.actif) {
        await tx.filiereMontant.updateMany({ where: { filiereId }, data: { actif: false } });
      }
      const montant = await tx.filiereMontant.create({
        data: { filiereId, montant: dto.montant, actif: !!dto.actif },
      });
      if (dto.actif) {
        await tx.filiere.update({ where: { id: filiereId }, data: { prix: dto.montant } });
      }
      return montant;
    });
  }

  async activerMontant(filiereId: string, montantId: string) {
    await this.findOne(filiereId);
    const montant = await this.prisma.filiereMontant.findUnique({ where: { id: montantId } });
    if (!montant || montant.filiereId !== filiereId) {
      throw new NotFoundException(`Montant #${montantId} introuvable pour cette filière`);
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.filiereMontant.updateMany({ where: { filiereId }, data: { actif: false } });
      const updated = await tx.filiereMontant.update({ where: { id: montantId }, data: { actif: true } });
      await tx.filiere.update({ where: { id: filiereId }, data: { prix: updated.montant } });
      return updated;
    });
  }

  async removeMontant(filiereId: string, montantId: string) {
    await this.findOne(filiereId);
    const montant = await this.prisma.filiereMontant.findUnique({ where: { id: montantId } });
    if (!montant || montant.filiereId !== filiereId) {
      throw new NotFoundException(`Montant #${montantId} introuvable pour cette filière`);
    }
    if (montant.actif) {
      throw new BadRequestException('Impossible de supprimer le montant actif. Activez-en un autre avant.');
    }
    return this.prisma.filiereMontant.delete({ where: { id: montantId } });
  }
}
