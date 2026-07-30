import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqItemDto } from './dto/create-faq-item.dto';
import { UpdateFaqItemDto } from './dto/update-faq-item.dto';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  /** Retourne toutes les FAQ publiées, groupées par catégorie (pour le frontend public) */
  async findAllPublished() {
    const items = await this.prisma.faqItem.findMany({
      where: { publie: true },
      orderBy: [{ categorie: 'asc' }, { ordre: 'asc' }, { createdAt: 'asc' }],
    });

    // Grouper par catégorie
    const grouped = items.reduce(
      (acc, item) => {
        if (!acc[item.categorie]) {
          acc[item.categorie] = { categorie: item.categorie, icone: item.icone, items: [] };
        }
        acc[item.categorie].items.push(item);
        return acc;
      },
      {} as Record<string, { categorie: string; icone: string; items: typeof items }>,
    );

    return Object.values(grouped);
  }

  /** Retourne tous les items (admin) au format Paginated */
  async findAllAdmin() {
    const items = await this.prisma.faqItem.findMany({
      orderBy: [{ categorie: 'asc' }, { ordre: 'asc' }],
    });
    return { items, total: items.length, page: 1, limit: items.length || 100 };
  }

  async findOne(id: string) {
    const item = await this.prisma.faqItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`FAQ item #${id} introuvable`);
    return item;
  }

  async create(dto: CreateFaqItemDto) {
    return this.prisma.faqItem.create({ data: dto });
  }

  async update(id: string, dto: UpdateFaqItemDto) {
    await this.findOne(id);
    return this.prisma.faqItem.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.faqItem.delete({ where: { id } });
  }
}
