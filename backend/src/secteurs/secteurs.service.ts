import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateSecteurDto } from './dto/create-secteur.dto';
import { UpdateSecteurDto } from './dto/update-secteur.dto';

@Injectable()
export class SecteursService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.secteur.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { ordre: 'asc' },
      }),
      this.prisma.secteur.count(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(slug: string) {
    const secteur = await this.prisma.secteur.findUnique({
      where: { slug },
      include: { metiers: true },
    });
    if (!secteur) throw new NotFoundException('Secteur introuvable');
    return secteur;
  }

  private async uniqueSlug(nom: string, ignoreId?: string) {
    const base = slugify(nom);
    let slug = base;
    let i = 1;
    while (
      await this.prisma.secteur.findFirst({ where: { slug, NOT: ignoreId ? { id: ignoreId } : undefined } })
    ) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  async create(dto: CreateSecteurDto) {
    const slug = await this.uniqueSlug(dto.nom);
    return this.prisma.secteur.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: UpdateSecteurDto) {
    const existing = await this.prisma.secteur.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Secteur introuvable');
    const slug = dto.nom ? await this.uniqueSlug(dto.nom, id) : undefined;
    return this.prisma.secteur.update({ where: { id }, data: { ...dto, ...(slug && { slug }) } });
  }

  async remove(id: string) {
    const existing = await this.prisma.secteur.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Secteur introuvable');
    const metiersCount = await this.prisma.metier.count({ where: { secteurId: id } });
    if (metiersCount > 0) {
      throw new ConflictException('Impossible de supprimer un secteur utilise par des metiers');
    }
    await this.prisma.secteur.delete({ where: { id } });
    return { message: 'Secteur supprime' };
  }

  countAll() {
    return this.prisma.secteur.count();
  }
}
