import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotificationDto } from './dto/query-notification.dto';

export interface CreateNotificationInput {
  utilisateurId: string;
  type: string;
  titre: string;
  message: string;
  lien?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(input: CreateNotificationInput) {
    return this.prisma.notification.create({ data: input });
  }

  async findAll(utilisateurId: string, query: QueryNotificationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.NotificationWhereInput = { utilisateurId };
    if (query.nonLuesSeulement) where.lu = false;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  countUnread(utilisateurId: string) {
    return this.prisma.notification.count({ where: { utilisateurId, lu: false } });
  }

  async markAsRead(id: string, utilisateurId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification introuvable');
    if (notification.utilisateurId !== utilisateurId) {
      throw new ForbiddenException("Vous n'avez pas l'autorisation d'accéder à cette notification");
    }
    return this.prisma.notification.update({ where: { id }, data: { lu: true } });
  }

  async markAllAsRead(utilisateurId: string) {
    await this.prisma.notification.updateMany({
      where: { utilisateurId, lu: false },
      data: { lu: true },
    });
    return { message: 'Notifications marquées comme lues' };
  }
}
