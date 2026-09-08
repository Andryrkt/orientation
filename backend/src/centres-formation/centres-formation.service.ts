import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatut, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateCentreFormationDto } from './dto/create-centre-formation.dto';
import { UpdateCentreFormationDto } from './dto/update-centre-formation.dto';
import { UpdateMyCentreFormationDto } from './dto/update-my-centre-formation.dto';
import { QueryCentreFormationDto } from './dto/query-centre-formation.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true, email: true } };

@Injectable()
export class CentresFormationService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.centreFormation.update({
      where: { id },
      data: { ...dto, ...(slug && { slug }) },
    });
  }

  async updateMine(auteurId: string, id: string, dto: UpdateMyCentreFormationDto) {
    const existing = await this.prisma.centreFormation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Centre de formation introuvable');
    if (existing.auteurId !== auteurId) throw new ForbiddenException();

    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    return this.prisma.centreFormation.update({
      where: { id },
      data: {
        ...dto,
        ...(slug && { slug }),
        // Toute modification renvoie la fiche en modération, même si elle était déjà publiée.
        statutValidation: BlogStatut.EN_ATTENTE,
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
