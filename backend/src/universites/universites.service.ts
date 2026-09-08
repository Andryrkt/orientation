import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BlogStatut, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateUniversiteDto } from './dto/create-universite.dto';
import { UpdateUniversiteDto } from './dto/update-universite.dto';
import { UpdateMyUniversiteDto } from './dto/update-my-universite.dto';
import { QueryUniversiteDto } from './dto/query-universite.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true, email: true } };

@Injectable()
export class UniversitesService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.universite.update({
      where: { id },
      data: { ...rest, ...(slug && { slug }), ...(photos && { photos }) },
    });
  }

  async updateMine(auteurId: string, id: string, dto: UpdateMyUniversiteDto) {
    const existing = await this.prisma.universite.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Universite introuvable');
    if (existing.auteurId !== auteurId) throw new ForbiddenException();

    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    const { photos, ...rest } = dto;
    return this.prisma.universite.update({
      where: { id },
      data: {
        ...rest,
        ...(slug && { slug }),
        ...(photos && { photos }),
        // Toute modification renvoie la fiche en modération, même si elle était déjà publiée.
        statutValidation: BlogStatut.EN_ATTENTE,
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
