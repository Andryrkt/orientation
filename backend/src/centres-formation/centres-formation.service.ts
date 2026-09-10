import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatut, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { slugify } from '../common/utils/slugify';
import { hasMajorChange } from '../common/utils/has-major-change';
import { CreateCentreFormationDto } from './dto/create-centre-formation.dto';
import { UpdateCentreFormationDto } from './dto/update-centre-formation.dto';
import { UpdateMyCentreFormationDto } from './dto/update-my-centre-formation.dto';
import { QueryCentreFormationDto } from './dto/query-centre-formation.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true, email: true } };

// Cf. universites.service.ts : seuls ces champs remettent la fiche en modération.
const CHAMPS_MAJEURS_CENTRE_FORMATION = ['nom', 'ville', 'region'] as const;

@Injectable()
export class CentresFormationService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryCentreFormationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CentreFormationWhereInput = {
      statutValidation: BlogStatut.APPROUVE,
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.ville && { ville: { equals: query.ville, mode: 'insensitive' } }),
      ...(query.q && { nom: { contains: query.q, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.centreFormation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.centreFormation.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const centre = await this.prisma.centreFormation.findUnique({
      where: { slug },
      include: { formations: { orderBy: { nom: 'asc' } } },
    });
    if (!centre || centre.statutValidation !== BlogStatut.APPROUVE) {
      throw new NotFoundException('Centre de formation introuvable');
    }
    return centre;
  }

  async findMine(auteurId: string) {
    return this.prisma.centreFormation.findMany({
      where: { auteurId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(query: QueryCentreFormationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CentreFormationWhereInput = {
      ...(query.region && { region: { equals: query.region, mode: 'insensitive' } }),
      ...(query.ville && { ville: { equals: query.ville, mode: 'insensitive' } }),
      ...(query.q && { nom: { contains: query.q, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.centreFormation.findMany({
        where,
        include: { auteur: AUTEUR_SELECT },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.centreFormation.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.centreFormation.findFirst({
        where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined },
      })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(auteurId: string, isAdmin: boolean, isGestionnaire: boolean, dto: CreateCentreFormationDto) {
    if (!isAdmin && !isGestionnaire) {
      throw new ForbiddenException("Seul un gestionnaire d'établissement peut ajouter un centre de formation");
    }
    const slug = await this.uniqueSlug(dto.nom);
    return this.prisma.centreFormation.create({
      data: {
        ...dto,
        slug,
        auteurId,
        statutValidation: isAdmin ? BlogStatut.APPROUVE : BlogStatut.EN_ATTENTE,
      },
    });
  }

  async update(id: string, dto: UpdateCentreFormationDto) {
    const existing = await this.prisma.centreFormation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Centre de formation introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    const updated = await this.prisma.centreFormation.update({
      where: { id },
      data: { ...dto, ...(slug && { slug }) },
    });
    await this.notifyValidationChange(existing, updated);
    return updated;
  }

  // Cf. universites.service.ts : prévient le gestionnaire de l'issue de la modération.
  private async notifyValidationChange(
    existing: { auteurId: string | null; statutValidation: BlogStatut; nom: string },
    updated: { statutValidation: BlogStatut },
  ) {
    if (!existing.auteurId || updated.statutValidation === existing.statutValidation) return;
    if (updated.statutValidation !== BlogStatut.APPROUVE && updated.statutValidation !== BlogStatut.REJETE) return;

    const approuve = updated.statutValidation === BlogStatut.APPROUVE;
    await this.notificationsService.create({
      utilisateurId: existing.auteurId,
      type: 'VALIDATION_CENTRE_FORMATION',
      titre: approuve ? 'Centre de formation approuvé' : 'Centre de formation refusé',
      message: approuve
        ? `Votre centre de formation "${existing.nom}" a été approuvé et est maintenant visible publiquement.`
        : `Votre centre de formation "${existing.nom}" a été refusé par un modérateur.`,
      lien: '/mes-etablissements',
    });
  }

  async updateMine(auteurId: string, id: string, dto: UpdateMyCentreFormationDto) {
    const existing = await this.prisma.centreFormation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Centre de formation introuvable');
    if (existing.auteurId !== auteurId) throw new ForbiddenException();

    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    const statutValidation = hasMajorChange(existing, dto, CHAMPS_MAJEURS_CENTRE_FORMATION)
      ? BlogStatut.EN_ATTENTE
      : existing.statutValidation;
    return this.prisma.centreFormation.update({
      where: { id },
      data: {
        ...dto,
        ...(slug && { slug }),
        statutValidation,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.centreFormation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Centre de formation introuvable');
    await this.prisma.centreFormation.delete({ where: { id } });
    return { message: 'Centre de formation supprime' };
  }

  countAll() {
    return this.prisma.centreFormation.count();
  }
}
