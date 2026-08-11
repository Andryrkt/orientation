import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';

@Injectable()
export class FilieresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFiliereDto) {
    return this.prisma.filiere.create({ data: dto });
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
    return this.prisma.filiere.delete({ where: { id } });
  }
}
