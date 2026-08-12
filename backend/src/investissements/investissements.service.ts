import { Injectable, NotFoundException } from '@nestjs/common';
import { StatutInvestissement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestissementDto } from './dto/create-investissement.dto';
import { UpdateInvestissementDto } from './dto/update-investissement.dto';

interface PlageDates {
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class InvestissementsService {
  constructor(private prisma: PrismaService) {}

  private whereDate(query: PlageDates) {
    if (!query.dateFrom && !query.dateTo) return {};
    return {
      date: {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      },
    };
  }

  async create(dto: CreateInvestissementDto) {
    return this.prisma.investissement.create({ data: { ...dto, date: new Date(dto.date) } });
  }

  async findAllAdmin(query: PlageDates) {
    const items = await this.prisma.investissement.findMany({
      where: this.whereDate(query),
      orderBy: { date: 'desc' },
    });
    return { items, total: items.length, page: 1, limit: items.length || 100 };
  }

  /** Somme des investissements effectivement reçus (les montants "promis" ne comptent pas comme trésorerie réelle). */
  async total(query: PlageDates) {
    const resultat = await this.prisma.investissement.aggregate({
      where: { ...this.whereDate(query), statut: StatutInvestissement.RECU },
      _sum: { montant: true },
    });
    return { total: resultat._sum.montant ?? 0 };
  }

  async findOne(id: string) {
    const item = await this.prisma.investissement.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Investissement #${id} introuvable`);
    return item;
  }

  async update(id: string, dto: UpdateInvestissementDto) {
    await this.findOne(id);
    return this.prisma.investissement.update({
      where: { id },
      data: { ...dto, ...(dto.date ? { date: new Date(dto.date) } : {}) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.investissement.delete({ where: { id } });
  }
}
