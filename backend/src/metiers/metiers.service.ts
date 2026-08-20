import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import pdfParse from 'pdf-parse';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateMetierDto } from './dto/create-metier.dto';
import { UpdateMetierDto } from './dto/update-metier.dto';
import { QueryMetierDto } from './dto/query-metier.dto';
import { parseMetierFiche } from './metier-pdf-parser';

@Injectable()
export class MetiersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryMetierDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.MetierWhereInput = {
      ...(query.domaine && { domaine: { slug: query.domaine } }),
      ...(query.niveauRequis && { niveauRequis: { contains: query.niveauRequis, mode: 'insensitive' } }),
      ...(query.q && { nom: { contains: query.q, mode: 'insensitive' } }),
      ...((query.salaireMin || query.salaireMax) && {
        AND: [
          ...(query.salaireMin ? [{ salaireMax: { gte: query.salaireMin } }] : []),
          ...(query.salaireMax ? [{ salaireMin: { lte: query.salaireMax } }] : []),
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.metier.findMany({
        where,
        include: { domaine: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      this.prisma.metier.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const metier = await this.prisma.metier.findUnique({
      where: { slug },
      include: { domaine: true },
    });
    if (!metier) throw new NotFoundException('Metier introuvable');
    const similaires = await this.prisma.metier.findMany({
      where: { domaineId: metier.domaineId, NOT: { id: metier.id } },
      take: 4,
    });
    return { ...metier, similaires };
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.metier.findFirst({ where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined } })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(dto: CreateMetierDto) {
    const slug = await this.uniqueSlug(dto.nom);
    const { competences, ...rest } = dto;
    return this.prisma.metier.create({
      data: { ...rest, slug, competences: competences ?? [] },
    });
  }

  async update(id: string, dto: UpdateMetierDto) {
    const existing = await this.prisma.metier.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Metier introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    const { competences, ...rest } = dto;
    return this.prisma.metier.update({
      where: { id },
      data: {
        ...rest,
        ...(slug && { slug }),
        ...(competences && { competences }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.metier.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Metier introuvable');
    await this.prisma.metier.delete({ where: { id } });
    return { message: 'Metier supprime' };
  }

  countAll() {
    return this.prisma.metier.count();
  }

  private normalizeForMatch(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private async matchDomaine(domainePrincipalRaw: string | undefined) {
    if (!domainePrincipalRaw) return { matchedDomaineId: undefined, warning: undefined };
    const domaines = await this.prisma.domaine.findMany();
    const target = this.normalizeForMatch(domainePrincipalRaw);
    const targetTokens = new Set(target.split(' ').filter((t) => t.length > 2));

    let bestId: string | undefined;
    let bestScore = 0;
    for (const domaine of domaines) {
      const candidate = this.normalizeForMatch(domaine.nom);
      let score = 0;
      if (candidate === target) score = 100;
      else if (target.includes(candidate) || candidate.includes(target)) score = 50;
      else score = candidate.split(' ').filter((t) => targetTokens.has(t)).length;
      if (score > bestScore) {
        bestScore = score;
        bestId = domaine.id;
      }
    }

    if (!bestId || bestScore < 1) {
      return {
        matchedDomaineId: undefined,
        warning: `Domaine principal du PDF (« ${domainePrincipalRaw} ») non reconnu automatiquement — sélectionnez-le manuellement.`,
      };
    }
    return { matchedDomaineId: bestId, warning: undefined };
  }

  async parseFichePdf(buffer: Buffer) {
    const data = await pdfParse(buffer);
    const { fields, domainePrincipalRaw, warnings } = parseMetierFiche(data.text);
    const { matchedDomaineId, warning } = await this.matchDomaine(domainePrincipalRaw);
    return {
      fields,
      matchedDomaineId,
      warnings: warning ? [...warnings, warning] : warnings,
    };
  }
}
