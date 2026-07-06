import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private userSelect = {
    id: true,
    nom: true,
    prenom: true,
    email: true,
    telephone: true,
    role: true,
    emailVerifiedAt: true,
    createdAt: true,
    profil: true,
  };

  async findMe(userId: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const { nom, prenom, ...profilFields } = dto;
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        ...(nom && { nom }),
        ...(prenom && { prenom }),
        profil: {
          upsert: {
            create: {
              ...profilFields,
              dateNaissance: profilFields.dateNaissance ? new Date(profilFields.dateNaissance) : undefined,
            },
            update: {
              ...profilFields,
              dateNaissance: profilFields.dateNaissance ? new Date(profilFields.dateNaissance) : undefined,
            },
          },
        },
      },
    });
    return this.findMe(userId);
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.utilisateur.findMany({
        select: this.userSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.utilisateur.count(),
    ]);
    return { items, total, page, limit };
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.utilisateur.update({
      where: { id },
      data: { role },
      select: this.userSelect,
    });
  }

  async remove(id: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.prisma.utilisateur.delete({ where: { id } });
    return { message: 'Utilisateur supprime' };
  }

  async countAll() {
    return this.prisma.utilisateur.count();
  }
}
