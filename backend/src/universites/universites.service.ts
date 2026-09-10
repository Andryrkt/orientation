import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatut, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { slugify } from '../common/utils/slugify';
import { hasMajorChange } from '../common/utils/has-major-change';
import { CreateUniversiteDto } from './dto/create-universite.dto';
import { UpdateUniversiteDto } from './dto/update-universite.dto';
import { UpdateMyUniversiteDto } from './dto/update-my-universite.dto';
import { QueryUniversiteDto } from './dto/query-universite.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true, email: true } };

// Champs dont la modification remet la fiche en modération. Les autres (téléphone, email, site
// web, photos...) sont des corrections mineures qui ne remettent pas en cause le contenu déjà
// validé — la fiche garde son statut si elle était déjà publiée.
const CHAMPS_MAJEURS_UNIVERSITE = ['nom', 'description', 'ville', 'region'] as const;

@Injectable()
export class UniversitesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryUniversiteDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UniversiteWhereInput = {
      statutValidation: BlogStatut.APPROUVE,
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.ville && { ville: { equals: query.ville, mode: 'insensitive' } }),
      ...(query.q && { nom: { contains: query.q, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.universite.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.universite.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const universite = await this.prisma.universite.findUnique({
      where: { slug },
      include: { mentions: { include: { parcours: true, domaine: true } } },
    });
    if (!universite || universite.statutValidation !== BlogStatut.APPROUVE) {
      throw new NotFoundException('Universite introuvable');
    }
    return universite;
  }

  async findMine(auteurId: string) {
    return this.prisma.universite.findMany({
      where: { auteurId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(query: QueryUniversiteDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.UniversiteWhereInput = {
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.ville && { ville: { equals: query.ville, mode: 'insensitive' } }),
      ...(query.q && { nom: { contains: query.q, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.universite.findMany({
        where,
        include: { auteur: AUTEUR_SELECT },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.universite.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.universite.findFirst({
        where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined },
      })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(auteurId: string, isAdmin: boolean, isGestionnaire: boolean, dto: CreateUniversiteDto) {
    if (!isAdmin && !isGestionnaire) {
      throw new ForbiddenException("Seul un gestionnaire d'établissement peut ajouter une université");
    }
    const slug = await this.uniqueSlug(dto.nom);
    const { photos, ...rest } = dto;
    return this.prisma.universite.create({
      data: {
        ...rest,
        slug,
        photos: photos ?? [],
        auteurId,
        statutValidation: isAdmin ? BlogStatut.APPROUVE : BlogStatut.EN_ATTENTE,
      },
    });
  }

  async update(id: string, dto: UpdateUniversiteDto) {
    const existing = await this.prisma.universite.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Universite introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    const { photos, ...rest } = dto;
    const updated = await this.prisma.universite.update({
      where: { id },
      data: { ...rest, ...(slug && { slug }), ...(photos && { photos }) },
    });
    await this.notifyValidationChange(existing, updated);
    return updated;
  }

  // Prévient le gestionnaire quand sa fiche est approuvée/refusée — symétrique aux notifications
  // déjà envoyées pour les demandes de rôle. Rien à notifier pour une fiche créée par un admin
  // (auteurId nul) ni si le statut de validation n'a pas changé.
  private async notifyValidationChange(
    existing: { auteurId: string | null; statutValidation: BlogStatut; nom: string },
    updated: { statutValidation: BlogStatut },
  ) {
    if (!existing.auteurId || updated.statutValidation === existing.statutValidation) return;
    if (updated.statutValidation !== BlogStatut.APPROUVE && updated.statutValidation !== BlogStatut.REJETE) return;

    const approuve = updated.statutValidation === BlogStatut.APPROUVE;
    await this.notificationsService.create({
      utilisateurId: existing.auteurId,
      type: 'VALIDATION_UNIVERSITE',
      titre: approuve ? 'Établissement approuvé' : 'Établissement refusé',
      message: approuve
        ? `Votre établissement "${existing.nom}" a été approuvé et est maintenant visible publiquement.`
        : `Votre établissement "${existing.nom}" a été refusé par un modérateur.`,
      lien: '/mes-etablissements',
    });
  }

  async updateMine(auteurId: string, id: string, dto: UpdateMyUniversiteDto) {
    const existing = await this.prisma.universite.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Universite introuvable');
    if (existing.auteurId !== auteurId) throw new ForbiddenException();

    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    const { photos, ...rest } = dto;
    // Une correction mineure (téléphone, email, site web, photos...) sur une fiche déjà publiée
    // n'a pas besoin d'être revalidée ; un changement de contenu (nom, description, localisation) si.
    const statutValidation = hasMajorChange(existing, rest, CHAMPS_MAJEURS_UNIVERSITE)
      ? BlogStatut.EN_ATTENTE
      : existing.statutValidation;
    return this.prisma.universite.update({
      where: { id },
      data: {
        ...rest,
        ...(slug && { slug }),
        ...(photos && { photos }),
        statutValidation,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.universite.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Universite introuvable');
    await this.prisma.universite.delete({ where: { id } });
    return { message: 'Universite et ses mentions/parcours associes supprimes' };
  }

  countAll() {
    return this.prisma.universite.count();
  }
}
