import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { UpdateRessourceDto } from './dto/update-ressource.dto';
import { QueryRessourceDto } from './dto/query-ressource.dto';

@Injectable()
export class RessourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryRessourceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.RessourceWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.categorie && { categorie: { equals: query.categorie, mode: 'insensitive' } }),
      ...(query.niveauEtude && { niveauEtude: { equals: query.niveauEtude, mode: 'insensitive' } }),
      ...(query.search && {
        OR: [
          { titre: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { contenu: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.ressource.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ressource.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const ressource = await this.prisma.ressource.findUnique({ where: { id } });
    if (!ressource) throw new NotFoundException('Ressource introuvable');
    return ressource;
  }

  create(dto: CreateRessourceDto) {
    return this.prisma.ressource.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateRessourceDto) {
    const existing = await this.prisma.ressource.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ressource introuvable');
    return this.prisma.ressource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.ressource.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ressource introuvable');
    await this.prisma.ressource.delete({ where: { id } });
    return { message: 'Ressource supprimée' };
  }

  countAll() {
    return this.prisma.ressource.count();
  }
}
