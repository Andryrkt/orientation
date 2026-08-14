import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';
import { UpsertBudgetDetailDto } from './dto/upsert-budget-detail.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  private plageDuMois(annee: number, mois: number) {
    const debut = new Date(Date.UTC(annee, mois - 1, 1));
    const fin = new Date(Date.UTC(annee, mois, 1));
    return { debut, fin };
  }

  // Fusionne les lignes de budget du mois avec les catégories réellement dépensées ce mois-ci
  // (même sans budget défini), pour ne jamais masquer une dépense hors budget.
  async findAllAdmin(annee: number, mois: number) {
    const { debut, fin } = this.plageDuMois(annee, mois);

    const [budgets, depenses, details] = await Promise.all([
      this.prisma.budgetCategorie.findMany({ where: { annee, mois } }),
      this.prisma.depenseGlobale.groupBy({
        by: ['categorie'],
        where: { date: { gte: debut, lt: fin } },
        _sum: { montant: true },
      }),
      this.prisma.budgetDetailLigne.groupBy({
        by: ['categorie'],
        where: { annee, mois },
        _count: { _all: true },
      }),
    ]);

    const depenseParCategorie = new Map(depenses.map((d) => [d.categorie, d._sum.montant ?? 0]));
    const detailsCountParCategorie = new Map(details.map((d) => [d.categorie, d._count._all]));
    const categories = new Set([...budgets.map((b) => b.categorie), ...depenses.map((d) => d.categorie)]);

    const items = Array.from(categories)
      .map((categorie) => {
        const budget = budgets.find((b) => b.categorie === categorie);
        const montantDepense = depenseParCategorie.get(categorie) ?? 0;
        const montantBudget = budget?.montant ?? null;
        return {
          id: budget?.id ?? null,
          categorie,
          annee,
          mois,
          montantBudget,
          montantDepense,
          ecart: montantBudget !== null ? montantBudget - montantDepense : null,
          detailsCount: detailsCountParCategorie.get(categorie) ?? 0,
        };
      })
      .sort((a, b) => a.categorie.localeCompare(b.categorie));

    const totalBudget = budgets.reduce((s, b) => s + b.montant, 0);
    const totalDepense = Array.from(depenseParCategorie.values()).reduce((s, m) => s + m, 0);

    return { items, totalBudget, totalDepense, ecartTotal: totalBudget - totalDepense };
  }

  async upsert(dto: UpsertBudgetDto) {
    return this.prisma.budgetCategorie.upsert({
      where: { categorie_annee_mois: { categorie: dto.categorie, annee: dto.annee, mois: dto.mois } },
      create: dto,
      update: { montant: dto.montant },
    });
  }

  async remove(id: string) {
    const budget = await this.prisma.budgetCategorie.findUnique({ where: { id } });
    if (!budget) throw new NotFoundException(`Budget #${id} introuvable`);
    return this.prisma.budgetCategorie.delete({ where: { id } });
  }

  // Reprend les montants du mois précédent comme point de départ pour un nouveau mois, sans
  // écraser les lignes déjà définies sur le mois cible (un admin a pu déjà commencer à l'ajuster).
  async dupliquerDepuis(anneeSource: number, moisSource: number, anneeCible: number, moisCible: number) {
    if (anneeSource === anneeCible && moisSource === moisCible) {
      throw new BadRequestException('Le mois source et le mois cible doivent être différents');
    }
    const budgetsSource = await this.prisma.budgetCategorie.findMany({ where: { annee: anneeSource, mois: moisSource } });
    const budgetsCibleExistants = await this.prisma.budgetCategorie.findMany({ where: { annee: anneeCible, mois: moisCible } });
    const categoriesExistantes = new Set(budgetsCibleExistants.map((b) => b.categorie));

    const aCreer = budgetsSource.filter((b) => !categoriesExistantes.has(b.categorie));
    if (aCreer.length === 0) return { creees: 0 };

    await this.prisma.budgetCategorie.createMany({
      data: aCreer.map((b) => ({ categorie: b.categorie, annee: anneeCible, mois: moisCible, montant: b.montant })),
    });
    return { creees: aCreer.length };
  }

  async categoriesConnues() {
    const [depenses, budgets] = await Promise.all([
      this.prisma.depenseGlobale.findMany({ select: { categorie: true }, distinct: ['categorie'] }),
      this.prisma.budgetCategorie.findMany({ select: { categorie: true }, distinct: ['categorie'] }),
    ]);
    const categories = new Set([...depenses.map((d) => d.categorie), ...budgets.map((b) => b.categorie)]);
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }

  // Montant d'une ligne de détail : taux × quantité par période × nombre de périodes, arrondi à
  // l'Ariary le plus proche, plus un éventuel ajustement (ex: demi-journée en plus un mois donné).
  private montantLigneDetail(ligne: { tauxUnitaire: number; quantite: number; nombrePeriodes: number; ajustementMontant: number | null }) {
    const base = Math.round(ligne.tauxUnitaire * ligne.quantite * ligne.nombrePeriodes);
    return base + (ligne.ajustementMontant ?? 0);
  }

  private avecMontant<T extends { tauxUnitaire: number; quantite: number; nombrePeriodes: number; ajustementMontant: number | null }>(
    ligne: T,
  ) {
    return { ...ligne, montant: this.montantLigneDetail(ligne) };
  }

  // Garde le montant de la catégorie synchronisé avec la somme de ses lignes de détail : le
  // détail est la source de vérité dès qu'il existe, jamais un chiffre saisi à la main en parallèle.
  private async resynchroniserBudget(categorie: string, annee: number, mois: number) {
    const details = await this.prisma.budgetDetailLigne.findMany({ where: { categorie, annee, mois } });
    if (details.length === 0) return;
    const total = details.reduce((s, d) => s + this.montantLigneDetail(d), 0);
    await this.prisma.budgetCategorie.upsert({
      where: { categorie_annee_mois: { categorie, annee, mois } },
      create: { categorie, annee, mois, montant: total },
      update: { montant: total },
    });
  }

  async detailsAdmin(categorie: string, annee: number, mois: number) {
    const lignes = await this.prisma.budgetDetailLigne.findMany({
      where: { categorie, annee, mois },
      orderBy: { createdAt: 'asc' },
    });
    return lignes.map((l) => this.avecMontant(l));
  }

  async upsertDetail(dto: UpsertBudgetDetailDto) {
    const cree = await this.prisma.budgetDetailLigne.create({ data: dto });
    await this.resynchroniserBudget(dto.categorie, dto.annee, dto.mois);
    return this.avecMontant(cree);
  }

  async updateDetail(id: string, dto: UpsertBudgetDetailDto) {
    const existant = await this.prisma.budgetDetailLigne.findUnique({ where: { id } });
    if (!existant) throw new NotFoundException(`Ligne de détail #${id} introuvable`);
    const maj = await this.prisma.budgetDetailLigne.update({ where: { id }, data: dto });
    await this.resynchroniserBudget(dto.categorie, dto.annee, dto.mois);
    return this.avecMontant(maj);
  }

  async removeDetail(id: string) {
    const existant = await this.prisma.budgetDetailLigne.findUnique({ where: { id } });
    if (!existant) throw new NotFoundException(`Ligne de détail #${id} introuvable`);
    await this.prisma.budgetDetailLigne.delete({ where: { id } });
    await this.resynchroniserBudget(existant.categorie, existant.annee, existant.mois);
    return { message: 'Ligne supprimée' };
  }
}
