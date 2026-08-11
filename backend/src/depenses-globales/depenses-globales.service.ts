import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepenseGlobaleDto } from './dto/create-depense-globale.dto';
import { UpdateDepenseGlobaleDto } from './dto/update-depense-globale.dto';

interface PlageDates {
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class DepensesGlobalesService {
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

  async create(dto: CreateDepenseGlobaleDto) {
    return this.prisma.depenseGlobale.create({ data: { ...dto, date: new Date(dto.date) } });
  }

  async findAllAdmin(query: PlageDates) {
    const items = await this.prisma.depenseGlobale.findMany({
      where: this.whereDate(query),
      orderBy: { date: 'desc' },
    });
    return { items, total: items.length, page: 1, limit: items.length || 100 };
  }

  async total(query: PlageDates) {
    const resultat = await this.prisma.depenseGlobale.aggregate({
      where: this.whereDate(query),
      _sum: { montant: true },
    });
    return { total: resultat._sum.montant ?? 0 };
  }

  async findOne(id: string) {
    const item = await this.prisma.depenseGlobale.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Dépense globale #${id} introuvable`);
    return item;
  }

  async update(id: string, dto: UpdateDepenseGlobaleDto) {
    await this.findOne(id);
    return this.prisma.depenseGlobale.update({
      where: { id },
      data: { ...dto, ...(dto.date ? { date: new Date(dto.date) } : {}) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.depenseGlobale.delete({ where: { id } });
  }
}
