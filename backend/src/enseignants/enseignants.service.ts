import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatut, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { hasMajorChange } from '../common/utils/has-major-change';
import { CreateEnseignantDto } from './dto/create-enseignant.dto';
import { UpdateEnseignantDto } from './dto/update-enseignant.dto';
import { QueryEnseignantDto } from './dto/query-enseignant.dto';
import { CreateAvisDto } from './dto/create-avis.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true } };

// Cf. coachs.service.ts : seuls ces champs remettent la fiche en modération.
const CHAMPS_MAJEURS_ENSEIGNANT = ['bio', 'matieres', 'niveauxEtude', 'etablissement'] as const;

function withNoteMoyenne<T extends { avis: { note: number }[] }>(enseignant: T) {
  const { avis, ...rest } = enseignant;
  const noteMoyenne = avis.length ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length : null;
  return { ...rest, noteMoyenne, avisCount: avis.length };
}

@Injectable()
export class EnseignantsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAllVisible(query: QueryEnseignantDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filters: Prisma.EnseignantWhereInput[] = [{ visible: true }, { statutValidation: BlogStatut.APPROUVE }];
    if (query.matiere) filters.push({ matieres: { has: query.matiere } });
    if (query.niveauEtude) {
      filters.push({
        OR: [{ niveauxEtude: { isEmpty: true } }, { niveauxEtude: { has: query.niveauEtude } }],
      });
    }
    if (query.q) {
      filters.push({
        OR: [
          { nom: { contains: query.q, mode: 'insensitive' } },
          { prenom: { contains: query.q, mode: 'insensitive' } },
          { etablissement: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }
    const where: Prisma.EnseignantWhereInput = { AND: filters };

    const [items, total] = await Promise.all([
      this.prisma.enseignant.findMany({
        where,
        include: { avis: { select: { note: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enseignant.count({ where }),
    ]);
    return { items: items.map(withNoteMoyenne), total, page, limit };
  }

  async findOneVisible(id: string) {
    const enseignant = await this.prisma.enseignant.findUnique({
      where: { id },
      include: {
        avis: { include: { utilisateur: AUTEUR_SELECT }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!enseignant || !enseignant.visible || enseignant.statutValidation !== BlogStatut.APPROUVE) {
      throw new NotFoundException('Enseignant introuvable');
    }
    return withNoteMoyenne(enseignant);
  }

  findMine(utilisateurId: string) {
    return this.prisma.enseignant.findMany({ where: { utilisateurId }, orderBy: { createdAt: 'desc' } });
  }

  async findAllAdmin(query: QueryEnseignantDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.prisma.enseignant.findMany({
        include: { avis: { select: { note: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enseignant.count(),
    ]);
    return { items: items.map(withNoteMoyenne), total, page, limit };
  }

  async create(utilisateurId: string, isAdmin: boolean, isEnseignant: boolean, dto: CreateEnseignantDto) {
    if (isAdmin) {
      // nom/prenom sont requis pour une création admin (imposé côté formulaire) mais optionnels
      // dans le DTO pour permettre l'auto-création (cf. branche ci-dessous).
      return this.prisma.enseignant.create({ data: dto as Prisma.EnseignantUncheckedCreateInput });
    }
    if (!isEnseignant) {
      throw new ForbiddenException('Seul un enseignant peut ajouter un profil enseignant');
    }
    // Auto-service : l'identité vient toujours du compte connecté (jamais du corps de la requête),
    // pour permettre de créer plusieurs profils (Maths au lycée, Algèbre à l'université...) sans
    // pouvoir usurper un autre compte ni s'auto-approuver.
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable');
    const { utilisateurId: _ignored, visible: _ignoredVisible, ...rest } = dto;
    return this.prisma.enseignant.create({
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

  async updateMine(utilisateurId: string, id: string, dto: CreateEnseignantDto) {
    const existing = await this.prisma.enseignant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Profil enseignant introuvable');
    if (existing.utilisateurId !== utilisateurId) throw new ForbiddenException();
    const { utilisateurId: _ignored, nom: _ignoredNom, prenom: _ignoredPrenom, email: _ignoredEmail, visible: _ignoredVisible, ...rest } = dto;
    const statutValidation = hasMajorChange(existing, rest, CHAMPS_MAJEURS_ENSEIGNANT)
      ? BlogStatut.EN_ATTENTE
      : existing.statutValidation;
    return this.prisma.enseignant.update({
      where: { id },
      data: {
        ...rest,
        statutValidation,
      },
    });
  }

  async update(id: string, dto: UpdateEnseignantDto) {
    const existing = await this.prisma.enseignant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Enseignant introuvable');
    const updated = await this.prisma.enseignant.update({ where: { id }, data: dto });
    await this.notifyValidationChange(existing, updated);
    return updated;
  }

  // Cf. universites.service.ts : prévient l'enseignant de l'issue de la modération de ce profil.
  private async notifyValidationChange(
    existing: { utilisateurId: string | null; statutValidation: BlogStatut; nom: string; prenom: string },
    updated: { statutValidation: BlogStatut },
  ) {
    if (!existing.utilisateurId || updated.statutValidation === existing.statutValidation) return;
    if (updated.statutValidation !== BlogStatut.APPROUVE && updated.statutValidation !== BlogStatut.REJETE) return;

    const approuve = updated.statutValidation === BlogStatut.APPROUVE;
    await this.notificationsService.create({
      utilisateurId: existing.utilisateurId,
      type: 'VALIDATION_ENSEIGNANT',
      titre: approuve ? 'Profil enseignant approuvé' : 'Profil enseignant refusé',
      message: approuve
        ? `Votre profil enseignant "${existing.prenom} ${existing.nom}" a été approuvé et est maintenant visible publiquement.`
        : `Votre profil enseignant "${existing.prenom} ${existing.nom}" a été refusé par un modérateur.`,
      lien: '/mon-profil-professionnel',
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.enseignant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Enseignant introuvable');
    await this.prisma.enseignant.delete({ where: { id } });
    return { message: 'Enseignant supprime' };
  }

  async addAvis(enseignantId: string, userId: string, dto: CreateAvisDto) {
    const enseignant = await this.prisma.enseignant.findUnique({ where: { id: enseignantId } });
    if (!enseignant) throw new NotFoundException('Enseignant introuvable');
    return this.prisma.enseignantAvis.upsert({
      where: { enseignantId_utilisateurId: { enseignantId, utilisateurId: userId } },
      update: { note: dto.note, commentaire: dto.commentaire },
      create: { enseignantId, utilisateurId: userId, note: dto.note, commentaire: dto.commentaire },
    });
  }

  async removeAvis(enseignantId: string, avisId: string) {
    const avis = await this.prisma.enseignantAvis.findUnique({ where: { id: avisId } });
    if (!avis || avis.enseignantId !== enseignantId) throw new NotFoundException('Avis introuvable');
    await this.prisma.enseignantAvis.delete({ where: { id: avisId } });
    return { message: 'Avis supprime' };
  }

  countAll() {
    return this.prisma.enseignant.count();
  }
}
