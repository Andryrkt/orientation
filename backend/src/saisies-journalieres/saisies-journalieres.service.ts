import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Periode, TypeMouvement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PointsDeVenteService } from '../points-de-vente/points-de-vente.service';
import { dateDuJourMadagascar, lundiDeLaSemaine } from '../common/utils/date.util';
import { SubmitSaisieDto } from './dto/submit-saisie.dto';
import { UpdateSaisieDto } from './dto/update-saisie.dto';
import { QuerySaisiesDto } from './dto/query-saisies.dto';
import { CreateMouvementDto } from './dto/create-mouvement.dto';

@Injectable()
export class SaisiesJournalieresService {
  constructor(
    private prisma: PrismaService,
    private pointsDeVenteService: PointsDeVenteService,
  ) {}

  private async pointDeVenteDuSecretaire(utilisateurId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur?.pointDeVenteId) {
      throw new BadRequestException("Vous n'êtes assigné à aucun point de vente");
    }
    return utilisateur.pointDeVenteId;
  }

  async submit(utilisateurId: string, dto: SubmitSaisieDto) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const date = dateDuJourMadagascar();
    return this.prisma.saisieJournaliere.upsert({
      where: { pointDeVenteId_date_periode: { pointDeVenteId, date, periode: dto.periode } },
      update: {
        montantGagne: dto.montantGagne,
        montantDepense: dto.montantDepense,
        saisiParId: utilisateurId,
      },
      create: {
        pointDeVenteId,
        date,
        periode: dto.periode,
        montantGagne: dto.montantGagne,
        montantDepense: dto.montantDepense,
        saisiParId: utilisateurId,
      },
    });
  }

  async today(utilisateurId: string) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const date = dateDuJourMadagascar();
    const saisies = await this.prisma.saisieJournaliere.findMany({ where: { pointDeVenteId, date } });

    const parPeriode = (periode: Periode) => {
      const saisie = saisies.find((s) => s.periode === periode);
      return saisie
        ? { soumis: true, montantGagne: saisie.montantGagne, montantDepense: saisie.montantDepense }
        : { soumis: false };
    };

    return {
      pointDeVenteId,
      date: date.toISOString().slice(0, 10),
      midi: parPeriode(Periode.MIDI),
      apresMidi: parPeriode(Periode.APRES_MIDI),
    };
  }

  async ajouterMouvement(utilisateurId: string, dto: CreateMouvementDto) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const date = dateDuJourMadagascar();
    return this.prisma.mouvementCaisse.create({
      data: {
        pointDeVenteId,
        date,
        periode: dto.periode,
        type: dto.type,
        montant: dto.montant,
        note: dto.note,
        saisiParId: utilisateurId,
      },
    });
  }

  async mouvementsAujourdhui(utilisateurId: string) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const date = dateDuJourMadagascar();
    const mouvements = await this.prisma.mouvementCaisse.findMany({
      where: { pointDeVenteId, date },
      orderBy: { createdAt: 'asc' },
    });

    const parPeriode = (periode: Periode) => {
      const items = mouvements.filter((m) => m.periode === periode);
      return {
        items,
        totalGagne: items.filter((m) => m.type === TypeMouvement.GAGNE).reduce((s, m) => s + m.montant, 0),
        totalDepense: items.filter((m) => m.type === TypeMouvement.DEPENSE).reduce((s, m) => s + m.montant, 0),
      };
    };

    return { midi: parPeriode(Periode.MIDI), apresMidi: parPeriode(Periode.APRES_MIDI) };
  }

  async supprimerMouvement(utilisateurId: string, id: string) {
    const mouvement = await this.prisma.mouvementCaisse.findUnique({ where: { id } });
    if (!mouvement) throw new NotFoundException(`Mouvement #${id} introuvable`);
    if (mouvement.saisiParId !== utilisateurId) {
      throw new ForbiddenException("Vous ne pouvez supprimer que vos propres mouvements");
    }
    const aujourdhui = dateDuJourMadagascar();
    if (mouvement.date.getTime() !== aujourdhui.getTime()) {
      throw new ForbiddenException("Seuls les mouvements du jour même peuvent être supprimés");
    }
    return this.prisma.mouvementCaisse.delete({ where: { id } });
  }

  async findAllAdmin(query: QuerySaisiesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      ...(query.pointDeVenteId ? { pointDeVenteId: query.pointDeVenteId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            date: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.saisieJournaliere.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          pointDeVente: { select: { id: true, nom: true, ville: true } },
          saisiPar: { select: { id: true, nom: true, prenom: true } },
        },
      }),
      this.prisma.saisieJournaliere.count({ where }),
    ]);

    const mouvements = items.length
      ? await this.prisma.mouvementCaisse.groupBy({
          by: ['pointDeVenteId', 'date', 'periode', 'type'],
          where: {
            OR: items.map((s) => ({ pointDeVenteId: s.pointDeVenteId, date: s.date, periode: s.periode })),
          },
          _sum: { montant: true },
        })
      : [];

    const itemsAvecMouvements = items.map((s) => {
      const gagne = mouvements.find(
        (m) => m.pointDeVenteId === s.pointDeVenteId && m.date.getTime() === s.date.getTime() && m.periode === s.periode && m.type === TypeMouvement.GAGNE,
      );
      const depense = mouvements.find(
        (m) => m.pointDeVenteId === s.pointDeVenteId && m.date.getTime() === s.date.getTime() && m.periode === s.periode && m.type === TypeMouvement.DEPENSE,
      );
      return {
        ...s,
        mouvementsGagne: gagne?._sum.montant ?? null,
        mouvementsDepense: depense?._sum.montant ?? null,
      };
    });

    return { items: itemsAvecMouvements, total, page, limit };
  }

  async resumeAdmin(query: { dateFrom?: string; dateTo?: string; pointDeVenteId?: string }) {
    const aujourdhui = dateDuJourMadagascar();
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : aujourdhui;
    const dateTo = query.dateTo ? new Date(query.dateTo) : aujourdhui;

    const [pointsDeVenteActifs, saisiesRange, saisiesAujourdhui] = await Promise.all([
      this.pointsDeVenteService.findAllActifsAvecSecretaires(),
      this.prisma.saisieJournaliere.groupBy({
        by: ['pointDeVenteId'],
        where: {
          date: { gte: dateFrom, lte: dateTo },
          ...(query.pointDeVenteId ? { pointDeVenteId: query.pointDeVenteId } : {}),
        },
        _sum: { montantGagne: true, montantDepense: true },
      }),
      this.prisma.saisieJournaliere.findMany({ where: { date: aujourdhui } }),
    ]);

    const pointsDeVente = query.pointDeVenteId
      ? pointsDeVenteActifs.filter((pdv) => pdv.id === query.pointDeVenteId)
      : pointsDeVenteActifs;

    const totauxParPointDeVente = new Map(saisiesRange.map((s) => [s.pointDeVenteId, s._sum]));

    return pointsDeVente.map((pdv) => {
      const totaux = totauxParPointDeVente.get(pdv.id);
      const totalGagne = totaux?.montantGagne ?? 0;
      const totalDepense = totaux?.montantDepense ?? 0;

      const periodesSoumisesAujourdhui = saisiesAujourdhui
        .filter((s) => s.pointDeVenteId === pdv.id)
        .map((s) => s.periode);
      const manquantAujourdhui = [Periode.MIDI, Periode.APRES_MIDI].filter(
        (p) => !periodesSoumisesAujourdhui.includes(p),
      );

      return {
        pointDeVente: { id: pdv.id, nom: pdv.nom, ville: pdv.ville },
        totalGagne,
        totalDepense,
        manquantAujourdhui,
      };
    });
  }

  async resumeParSemaine(query: { dateFrom?: string; dateTo?: string; pointDeVenteId?: string }) {
    const where = {
      ...(query.pointDeVenteId ? { pointDeVenteId: query.pointDeVenteId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            date: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const saisies = await this.prisma.saisieJournaliere.findMany({
      where,
      select: { date: true, montantGagne: true, montantDepense: true },
    });

    const parSemaine = new Map<string, { semaineDebut: Date; totalGagne: number; totalDepense: number }>();
    for (const s of saisies) {
      const semaineDebut = lundiDeLaSemaine(s.date);
      const cle = semaineDebut.toISOString();
      const entry = parSemaine.get(cle) ?? { semaineDebut, totalGagne: 0, totalDepense: 0 };
      entry.totalGagne += s.montantGagne;
      entry.totalDepense += s.montantDepense;
      parSemaine.set(cle, entry);
    }

    return Array.from(parSemaine.values())
      .sort((a, b) => b.semaineDebut.getTime() - a.semaineDebut.getTime())
      .map(({ semaineDebut, totalGagne, totalDepense }) => {
        const semaineFin = new Date(semaineDebut);
        semaineFin.setUTCDate(semaineDebut.getUTCDate() + 6);
        return {
          semaineDebut: semaineDebut.toISOString().slice(0, 10),
          semaineFin: semaineFin.toISOString().slice(0, 10),
          totalGagne,
          totalDepense,
        };
      });
  }

  async updateAdmin(id: string, dto: UpdateSaisieDto) {
    const saisie = await this.prisma.saisieJournaliere.findUnique({ where: { id } });
    if (!saisie) throw new NotFoundException(`Saisie #${id} introuvable`);
    return this.prisma.saisieJournaliere.update({ where: { id }, data: dto });
  }
}
