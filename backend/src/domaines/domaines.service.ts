import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateDomaineDto } from './dto/create-domaine.dto';
import { UpdateDomaineDto } from './dto/update-domaine.dto';

@Injectable()
export class DomainesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.domaine.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { ordre: 'asc' },
      }),
      this.prisma.domaine.count(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const domaine = await this.prisma.domaine.findUnique({
      where: { slug },
      include: { metiers: true, mentions: true },
    });
    if (!domaine) throw new NotFoundException('Domaine introuvable');
    return domaine;
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.domaine.findFirst({ where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined } })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(dto: CreateDomaineDto) {
    const slug = await this.uniqueSlug(dto.nom);
    return this.prisma.domaine.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateDomaineDto) {
    const existing = await this.prisma.domaine.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Domaine introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    return this.prisma.domaine.update({ where: { id }, data: { ...dto, ...(slug && { slug }) } });
  }

  async remove(id: string) {
    const existing = await this.prisma.domaine.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Domaine introuvable');
    const metiersCount = await this.prisma.metier.count({ where: { domaineId: id } });
    const mentionsCount = await this.prisma.mention.count({ where: { domaineId: id } });
    if (metiersCount > 0 || mentionsCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer un domaine utilise par des metiers ou des mentions',
      );
    }
    await this.prisma.domaine.delete({ where: { id } });
    return { message: 'Domaine supprime' };
  }

  countAll() {
    return this.prisma.domaine.count();
  }
}
