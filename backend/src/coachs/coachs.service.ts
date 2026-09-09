import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatut, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { QueryCoachDto } from './dto/query-coach.dto';
import { CreateAvisDto } from './dto/create-avis.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true } };

function withNoteMoyenne<T extends { avis: { note: number }[] }>(coach: T) {
  const { avis, ...rest } = coach;
  const noteMoyenne = avis.length ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length : null;
  return { ...rest, noteMoyenne, avisCount: avis.length };
}

@Injectable()
export class CoachsService {
  constructor(private prisma: PrismaService) {}

  async findAllVisible(query: QueryCoachDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CoachWhereInput = {
      visible: true,
      statutValidation: BlogStatut.APPROUVE,
      ...(query.specialite && { specialites: { has: query.specialite } }),
      ...(query.q && {
        OR: [
          { nom: { contains: query.q, mode: 'insensitive' } },
          { prenom: { contains: query.q, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.coach.findMany({
        where,
        include: { avis: { select: { note: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coach.count({ where }),
    ]);
    return { items: items.map(withNoteMoyenne), total, page, limit };
  }

  async findOneVisible(id: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { id },
      include: {
        avis: { include: { utilisateur: AUTEUR_SELECT }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!coach || !coach.visible || coach.statutValidation !== BlogStatut.APPROUVE) {
      throw new NotFoundException('Coach introuvable');
    }
    return withNoteMoyenne(coach);
  }

  findMine(utilisateurId: string) {
    return this.prisma.coach.findMany({ where: { utilisateurId }, orderBy: { createdAt: 'desc' } });
  }

  async findAllAdmin(query: QueryCoachDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.prisma.coach.findMany({
        include: { avis: { select: { note: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.coach.count(),
    ]);
    return { items: items.map(withNoteMoyenne), total, page, limit };
  }

  async create(utilisateurId: string, isAdmin: boolean, isCoach: boolean, dto: CreateCoachDto) {
    if (isAdmin) {
      // nom/prenom sont requis pour une création admin (imposé côté formulaire) mais optionnels
      // dans le DTO pour permettre l'auto-création (cf. branche ci-dessous).
      return this.prisma.coach.create({ data: dto as Prisma.CoachUncheckedCreateInput });
    }
    if (!isCoach) {
      throw new ForbiddenException('Seul un coach peut ajouter un profil coach');
    }
    // Auto-service : l'identité vient toujours du compte connecté (jamais du corps de la requête),
    // pour permettre de créer plusieurs profils (coach sportif, coach en orientation...) sans
    // pouvoir usurper un autre compte ni s'auto-approuver.
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable');
    const { utilisateurId: _ignored, visible: _ignoredVisible, ...rest } = dto;
    return this.prisma.coach.create({
      data: {
        ...rest,
        utilisateurId,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        visible: true,
        statutValidation: BlogStatut.EN_ATTENTE,
      },
    });
  }

  async updateMine(utilisateurId: string, id: string, dto: CreateCoachDto) {
    const existing = await this.prisma.coach.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Profil coach introuvable');
    if (existing.utilisateurId !== utilisateurId) throw new ForbiddenException();
    const { utilisateurId: _ignored, nom: _ignoredNom, prenom: _ignoredPrenom, email: _ignoredEmail, visible: _ignoredVisible, ...rest } = dto;
    return this.prisma.coach.update({
      where: { id },
      data: {
        ...rest,
        // Toute modification renvoie la fiche en modération, même si elle était déjà publiée.
        statutValidation: BlogStatut.EN_ATTENTE,
      },
    });
  }

  async update(id: string, dto: UpdateCoachDto) {
    const existing = await this.prisma.coach.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Coach introuvable');
    return this.prisma.coach.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.prisma.coach.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Coach introuvable');
    await this.prisma.coach.delete({ where: { id } });
    return { message: 'Coach supprime' };
  }

  async addAvis(coachId: string, userId: string, dto: CreateAvisDto) {
    const coach = await this.prisma.coach.findUnique({ where: { id: coachId } });
    if (!coach) throw new NotFoundException('Coach introuvable');
    return this.prisma.coachAvis.upsert({
      where: { coachId_utilisateurId: { coachId, utilisateurId: userId } },
      update: { note: dto.note, commentaire: dto.commentaire },
      create: { coachId, utilisateurId: userId, note: dto.note, commentaire: dto.commentaire },
    });
  }

  async removeAvis(coachId: string, avisId: string) {
    const avis = await this.prisma.coachAvis.findUnique({ where: { id: avisId } });
    if (!avis || avis.coachId !== coachId) throw new NotFoundException('Avis introuvable');
    await this.prisma.coachAvis.delete({ where: { id: avisId } });
    return { message: 'Avis supprime' };
  }

  countAll() {
    return this.prisma.coach.count();
  }
}
