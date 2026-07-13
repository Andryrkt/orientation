import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { CreateTicketMessageDto } from './dto/create-ticket-message.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true, email: true } };

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(utilisateurId: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        sujet: dto.sujet,
        description: dto.description,
        priorite: dto.priorite,
        categorie: dto.categorie,
        utilisateurId,
      },
    });
  }

  async findAll(utilisateurId: string, role: Role, query: QueryTicketDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.TicketWhereInput = {};

    if (role !== Role.ADMIN) {
      where.utilisateurId = utilisateurId;
    }

    if (query.statut) {
      where.statut = query.statut;
    }

    if (query.priorite) {
      where.priorite = query.priorite;
    }

    if (query.q) {
      where.OR = [
        { sujet: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          utilisateur: AUTEUR_SELECT,
          _count: { select: { messages: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string, utilisateurId: string, role: Role) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        utilisateur: AUTEUR_SELECT,
        messages: {
          include: {
            auteur: AUTEUR_SELECT,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    if (role !== Role.ADMIN && ticket.utilisateurId !== utilisateurId) {
      throw new ForbiddenException("Vous n'avez pas l'autorisation d'accéder à ce ticket");
    }

    return ticket;
  }

  async update(id: string, utilisateurId: string, role: Role, dto: UpdateTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    if (role !== Role.ADMIN) {
      if (ticket.utilisateurId !== utilisateurId) {
        throw new ForbiddenException("Vous n'avez pas l'autorisation de modifier ce ticket");
      }
      if (ticket.statut === 'FERME') {
        throw new BadRequestException('Un ticket fermé ne peut plus être modifié');
      }
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async addMessage(ticketId: string, auteurId: string, role: Role, dto: CreateTicketMessageDto) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    if (role !== Role.ADMIN && ticket.utilisateurId !== auteurId) {
      throw new ForbiddenException("Vous n'avez pas l'autorisation d'ajouter un message à ce ticket");
    }

    if (ticket.statut === 'FERME') {
      throw new BadRequestException('Impossible d\'ajouter un message à un ticket fermé');
    }

    let nouveauStatut = ticket.statut;
    if (role === Role.ADMIN && ticket.statut === 'OUVERT') {
      nouveauStatut = 'EN_COURS';
    }

    const [message] = await Promise.all([
      this.prisma.ticketMessage.create({
        data: {
          ticketId,
          auteurId,
          message: dto.message,
        },
        include: {
          auteur: AUTEUR_SELECT,
        },
      }),
      this.prisma.ticket.update({
        where: { id: ticketId },
        data: { statut: nouveauStatut, updatedAt: new Date() },
      }),
    ]);

    return message;
  }

  countAll() {
    return this.prisma.ticket.count();
  }
}
