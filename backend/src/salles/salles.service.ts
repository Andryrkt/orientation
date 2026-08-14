import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';

@Injectable()
export class SallesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.salle.findMany({ orderBy: { nom: 'asc' } });
    return { items, total: items.length, page: 1, limit: items.length || 100 };
  }

  async create(dto: CreateSalleDto) {
    try {
      return await this.prisma.salle.create({ data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Une salle nommée "${dto.nom}" existe déjà`);
      }
      throw e;
    }
  }

  async findOne(id: string) {
    const salle = await this.prisma.salle.findUnique({ where: { id } });
    if (!salle) throw new NotFoundException(`Salle #${id} introuvable`);
    return salle;
  }

  async update(id: string, dto: UpdateSalleDto) {
    await this.findOne(id);
    try {
      return await this.prisma.salle.update({ where: { id }, data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Une salle nommée "${dto.nom}" existe déjà`);
      }
      throw e;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.salle.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new ConflictException('Cette salle est utilisée dans des séances de cours : retirez-la de ces séances avant de la supprimer');
      }
      throw e;
    }
  }
}
