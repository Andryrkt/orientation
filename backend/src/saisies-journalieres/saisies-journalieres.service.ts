import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Periode, Prisma, TypeMouvement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PointsDeVenteService } from '../points-de-vente/points-de-vente.service';
import { DroitInscriptionService } from '../droit-inscription/droit-inscription.service';
import { dateDuJourMadagascar, lundiDeLaSemaine } from '../common/utils/date.util';
import { SubmitSaisieDto } from './dto/submit-saisie.dto';
import { UpdateSaisieDto } from './dto/update-saisie.dto';
import { QuerySaisiesDto } from './dto/query-saisies.dto';
import { QueryEtudiantsDto } from './dto/query-etudiants.dto';
import { CreateMouvementDto } from './dto/create-mouvement.dto';
import { UpdateDatesCoursDto } from './dto/update-dates-cours.dto';

@Injectable()
export class SaisiesJournalieresService {
  constructor(
    private prisma: PrismaService,
    private pointsDeVenteService: PointsDeVenteService,
    private droitInscriptionService: DroitInscriptionService,
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
        fondDeCaisse: dto.fondDeCaisse ?? 0,
        montantCompte: dto.montantCompte,
        saisiParId: utilisateurId,
      },
      create: {
        pointDeVenteId,
        date,
        periode: dto.periode,
        montantGagne: dto.montantGagne,
        montantDepense: dto.montantDepense,
        fondDeCaisse: dto.fondDeCaisse ?? 0,
        montantCompte: dto.montantCompte,
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
        ? {
            soumis: true,
            montantGagne: saisie.montantGagne,
            montantDepense: saisie.montantDepense,
            fondDeCaisse: saisie.fondDeCaisse,
            montantCompte: saisie.montantCompte,
          }
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
    if (dto.inscriptionParentId) {
      return dto.filiereIds?.length
        ? this.ajouterFiliereComplementaire(utilisateurId, dto)
        : this.ajouterPaiementComplementaire(utilisateurId, dto);
    }

    const detailInscriptionRenseigne = !!(dto.nom || dto.prenom || dto.contact || dto.numeroRecu || dto.filiereIds?.length);
    if (detailInscriptionRenseigne && (!dto.nom?.trim() || !dto.prenom?.trim())) {
      throw new BadRequestException('Le nom et le prénom sont obligatoires pour enregistrer une inscription');
    }
    if (!dto.note?.trim() && !detailInscriptionRenseigne) {
      throw new BadRequestException('La note est obligatoire');
    }
    if (dto.reduction && dto.reduction > 0 && !dto.noteReduction?.trim()) {
      throw new BadRequestException('Une note est obligatoire lorsqu\'une réduction est saisie');
    }

    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const date = dateDuJourMadagascar();
    const droitInscription =
      dto.type === TypeMouvement.GAGNE && !dto.sansDroitInscription ? (await this.droitInscriptionService.get()).montant : null;

    return this.prisma.mouvementCaisse.create({
      data: {
        pointDeVenteId,
        date,
        periode: dto.periode,
        type: dto.type,
        montant: dto.montant,
        note: dto.note,
        saisiParId: utilisateurId,
        nom: dto.nom,
        prenom: dto.prenom,
        contact: dto.contact,
        numeroRecu: dto.numeroRecu,
        montantRestant: dto.montantRestant,
        montantTotal: dto.montantTotal,
        droitInscription,
        reduction: dto.reduction,
        noteReduction: dto.noteReduction,
        ...(dto.filiereIds?.length
          ? { filieresInscrites: { create: dto.filiereIds.map((filiereId) => ({ filiereId })) } }
          : {}),
      },
      include: { filieresInscrites: { include: { filiere: true } } },
    });
  }

  // Un étudiant qui revient payer son reste à payer génère un nouveau mouvement du jour (la caisse
  // du jour doit refléter l'argent réellement encaissé ce jour-là), mais rattaché à l'inscription
  // d'origine plutôt que traité comme une nouvelle inscription. Le solde restant est recalculé
  // côté serveur (jamais fait confiance au client) pour rester juste même en cas de paiements
  // concurrents.
  private async ajouterPaiementComplementaire(utilisateurId: string, dto: CreateMouvementDto) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const parent = await this.prisma.mouvementCaisse.findUnique({
      where: { id: dto.inscriptionParentId },
      include: { paiementsComplementaires: { select: { montant: true } } },
    });
    if (!parent) throw new NotFoundException(`Inscription #${dto.inscriptionParentId} introuvable`);
    if (parent.pointDeVenteId !== pointDeVenteId) {
      throw new ForbiddenException("Cette inscription n'appartient pas à votre point de vente");
    }
    if (parent.inscriptionParentId) {
      throw new BadRequestException('Impossible de rattacher un paiement à un autre paiement complémentaire');
    }
    if (parent.montantTotal === null) {
      throw new BadRequestException("Cette inscription n'a pas de montant total défini");
    }

    const dejaPaye = parent.montant + parent.paiementsComplementaires.reduce((s, p) => s + p.montant, 0);
    const montantRestant = Math.max(0, parent.montantTotal - dejaPaye - dto.montant);
    const date = dateDuJourMadagascar();

    return this.prisma.mouvementCaisse.create({
      data: {
        pointDeVenteId,
        date,
        periode: dto.periode,
        type: TypeMouvement.GAGNE,
        montant: dto.montant,
        note: dto.note?.trim() || 'Paiement complémentaire',
        saisiParId: utilisateurId,
        nom: parent.nom,
        prenom: parent.prenom,
        contact: parent.contact,
        numeroRecu: dto.numeroRecu,
        montantTotal: parent.montantTotal,
        montantRestant,
        inscriptionParentId: parent.id,
      },
      include: { filieresInscrites: { include: { filiere: true } } },
    });
  }

  // Un étudiant déjà inscrit qui veut suivre une filière supplémentaire : le droit d'inscription
  // n'est facturé qu'une fois par étudiant, donc on rattache la nouvelle filière à l'inscription
  // d'origine (comme un paiement complémentaire) et on augmente le montant total de l'inscription
  // au lieu d'en créer une nouvelle avec un droit d'inscription refacturé.
  private async ajouterFiliereComplementaire(utilisateurId: string, dto: CreateMouvementDto) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const parent = await this.prisma.mouvementCaisse.findUnique({
      where: { id: dto.inscriptionParentId },
      include: { paiementsComplementaires: { select: { montant: true } } },
    });
    if (!parent) throw new NotFoundException(`Inscription #${dto.inscriptionParentId} introuvable`);
    if (parent.pointDeVenteId !== pointDeVenteId) {
      throw new ForbiddenException("Cette inscription n'appartient pas à votre point de vente");
    }
    if (parent.inscriptionParentId) {
      throw new BadRequestException('Impossible de rattacher une filière à un autre paiement complémentaire');
    }
    if (parent.montantTotal === null) {
      throw new BadRequestException("Cette inscription n'a pas de montant total défini");
    }

    const nouvellesFilieres = await this.prisma.filiere.findMany({ where: { id: { in: dto.filiereIds! } } });
    const sommeNouvellesFilieres = nouvellesFilieres.reduce((s, f) => s + f.prix, 0);
    const nouveauMontantTotal = parent.montantTotal + sommeNouvellesFilieres;

    const dejaPaye = parent.montant + parent.paiementsComplementaires.reduce((s, p) => s + p.montant, 0);
    const montantRestant = Math.max(0, nouveauMontantTotal - dejaPaye - dto.montant);
    const date = dateDuJourMadagascar();

    const [, enfant] = await this.prisma.$transaction([
      this.prisma.mouvementCaisse.update({ where: { id: parent.id }, data: { montantTotal: nouveauMontantTotal } }),
      this.prisma.mouvementCaisse.create({
        data: {
          pointDeVenteId,
          date,
          periode: dto.periode,
          type: TypeMouvement.GAGNE,
          montant: dto.montant,
          note: dto.note?.trim() || 'Ajout de filière',
          saisiParId: utilisateurId,
          nom: parent.nom,
          prenom: parent.prenom,
          contact: parent.contact,
          numeroRecu: dto.numeroRecu,
          montantTotal: nouveauMontantTotal,
          montantRestant,
          inscriptionParentId: parent.id,
          filieresInscrites: { create: dto.filiereIds!.map((filiereId) => ({ filiereId })) },
        },
        include: { filieresInscrites: { include: { filiere: true } } },
      }),
    ]);

    return enfant;
  }

  async mouvementsAujourdhui(utilisateurId: string) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const date = dateDuJourMadagascar();
    const mouvements = await this.prisma.mouvementCaisse.findMany({
      where: { pointDeVenteId, date },
      orderBy: { createdAt: 'asc' },
      include: { filieresInscrites: { include: { filiere: true } } },
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

  // Permet à la secrétaire de retrouver un étudiant déjà inscrit (par nom, prénom ou numéro de
  // reçu) pour dupliquer son inscription lors d'un renouvellement (nouvelle filière, nouveau reçu),
  // ou pour enregistrer un paiement complémentaire sur son solde restant. Ne renvoie que les
  // inscriptions "racines" : les paiements complémentaires ne sont pas des étudiants à part entière.
  async rechercherEtudiants(utilisateurId: string, q: string) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const recherche = q?.trim();
    if (!recherche) return [];
    const resultats = await this.prisma.mouvementCaisse.findMany({
      where: {
        pointDeVenteId,
        type: TypeMouvement.GAGNE,
        nom: { not: null },
        inscriptionParentId: null,
        OR: [
          { nom: { contains: recherche, mode: 'insensitive' } },
          { prenom: { contains: recherche, mode: 'insensitive' } },
          { numeroRecu: { contains: recherche, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        filieresInscrites: { include: { filiere: true } },
        paiementsComplementaires: {
          select: { montant: true, filieresInscrites: { include: { filiere: true } } },
        },
      },
    });
    return resultats.map((m) => this.avecSoldeActuel(m));
  }

  // Calcule le total déjà payé et le solde restant "vivants" d'une inscription à partir de son
  // propre montant et de ses paiements complémentaires, plutôt que de faire confiance au
  // montantRestant figé au moment de la création (qui ne reflète que l'état à cette date-là).
  private avecSoldeActuel<T extends { montant: number; montantTotal: number | null; paiementsComplementaires: { montant: number }[] }>(
    m: T,
  ) {
    const montantPayeTotal = m.montant + m.paiementsComplementaires.reduce((s, p) => s + p.montant, 0);
    const montantRestantActuel = m.montantTotal !== null ? Math.max(0, m.montantTotal - montantPayeTotal) : null;
    return { ...m, montantPayeTotal, montantRestantActuel };
  }

  // Les dates de début/fin de cours se rattachent à une paire (mouvement, filière) : un même
  // étudiant inscrit dans plusieurs filières peut avoir un calendrier différent pour chacune.
  async filieresInscritesSuivi(utilisateurId: string) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    return this.prisma.inscriptionFiliere.findMany({
      where: {
        OR: [{ dateDebutCours: null }, { dateFinCours: null }],
        mouvement: { pointDeVenteId, type: TypeMouvement.GAGNE, nom: { not: null } },
      },
      orderBy: { mouvement: { createdAt: 'desc' } },
      include: { filiere: true, mouvement: true },
    });
  }

  private async trouverInscriptionDuPointDeVente(utilisateurId: string, id: string) {
    const pointDeVenteId = await this.pointDeVenteDuSecretaire(utilisateurId);
    const inscription = await this.prisma.inscriptionFiliere.findUnique({ where: { id }, include: { mouvement: true } });
    if (!inscription) throw new NotFoundException(`Inscription filière #${id} introuvable`);
    if (inscription.mouvement.pointDeVenteId !== pointDeVenteId) {
      throw new ForbiddenException("Cette inscription n'appartient pas à votre point de vente");
    }
    return inscription;
  }

  // La date de début et la date de fin peuvent être envoyées ensemble (ex: étudiant dont aucune
  // des deux dates n'est encore connue) ou séparément (ex: compléter la date de fin plus tard).
  async definirDatesCoursFiliere(utilisateurId: string, id: string, dto: UpdateDatesCoursDto) {
    if (!dto.dateDebutCours && !dto.dateFinCours) {
      throw new BadRequestException('Au moins une date doit être renseignée');
    }
    const inscription = await this.trouverInscriptionDuPointDeVente(utilisateurId, id);
    const dateDebutResolue = dto.dateDebutCours ?? inscription.dateDebutCours;
    if (dto.dateFinCours && !dateDebutResolue) {
      throw new BadRequestException('La date de début de cours doit être renseignée avant la date de fin');
    }
    return this.prisma.inscriptionFiliere.update({
      where: { id },
      data: {
        ...(dto.dateDebutCours ? { dateDebutCours: new Date(dto.dateDebutCours) } : {}),
        ...(dto.dateFinCours ? { dateFinCours: new Date(dto.dateFinCours) } : {}),
      },
      include: { filiere: true, mouvement: true },
    });
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

  // Vue finance/admin des étudiants inscrits par les secrétaires (une ligne par mouvement GAGNE
  // renseigné avec une identité), filtrable par secrétaire, point de vente et période.
  private whereEtudiantsAdmin(query: QueryEtudiantsDto) {
    const recherche = query.q?.trim();
    return {
      type: TypeMouvement.GAGNE,
      nom: { not: null },
      inscriptionParentId: null,
      ...(query.pointDeVenteId ? { pointDeVenteId: query.pointDeVenteId } : {}),
      ...(query.saisiParId ? { saisiParId: query.saisiParId } : {}),
      ...(query.filiereId ? { filieresInscrites: { some: { filiereId: query.filiereId } } } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            date: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
      ...(recherche
        ? {
            OR: [
              { nom: { contains: recherche, mode: 'insensitive' as const } },
              { prenom: { contains: recherche, mode: 'insensitive' as const } },
              { numeroRecu: { contains: recherche, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
  }

  // Le statut de paiement et le filtre "renouvellement" dependent de valeurs calculees (solde
  // agrege, nombre d'inscriptions homonymes) : impossible a traduire en clause SQL simple, donc on
  // recupere tout l'ensemble filtre, on calcule, on filtre puis on pagine cote serveur en memoire.
  async findAllEtudiantsAdmin(query: QueryEtudiantsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.whereEtudiantsAdmin(query);
    const include = {
      pointDeVente: { select: { id: true, nom: true, ville: true } },
      saisiPar: { select: { id: true, nom: true, prenom: true } },
      filieresInscrites: { include: { filiere: { select: { id: true, nom: true } } } },
      paiementsComplementaires: {
        orderBy: { createdAt: 'asc' as const },
        select: {
          id: true,
          date: true,
          montant: true,
          numeroRecu: true,
          saisiPar: { select: { id: true, nom: true, prenom: true } },
          filieresInscrites: { include: { filiere: { select: { id: true, nom: true } } } },
        },
      },
    };

    const filtragePostRequete = !!query.statut || !!query.renouvellement;

    type MouvementAvecInclude = Prisma.MouvementCaisseGetPayload<{ include: typeof include }>;
    let items: (MouvementAvecInclude & { montantPayeTotal: number; montantRestantActuel: number | null })[];
    let total: number;

    if (filtragePostRequete) {
      const tous = (
        await this.prisma.mouvementCaisse.findMany({ where, orderBy: { createdAt: 'desc' }, include })
      ).map((m) => this.avecSoldeActuel(m));

      let filtres = tous;
      if (query.statut) {
        filtres = filtres.filter((m) =>
          query.statut === 'PAYE'
            ? m.montantRestantActuel !== null && m.montantRestantActuel <= 0
            : m.montantRestantActuel !== null && m.montantRestantActuel > 0,
        );
      }
      if (query.renouvellement) {
        const compte = await this.compterInscriptionsParNomPrenom(filtres);
        filtres = filtres.filter((m) => (compte.get(`${m.nom}${m.prenom}`) ?? 1) > 1);
      }

      total = filtres.length;
      items = filtres.slice((page - 1) * limit, page * limit);
    } else {
      const [bruts, count] = await Promise.all([
        this.prisma.mouvementCaisse.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include }),
        this.prisma.mouvementCaisse.count({ where }),
      ]);
      items = bruts.map((m) => this.avecSoldeActuel(m));
      total = count;
    }

    const pairesNomPrenom = Array.from(
      new Map(items.map((m) => [`${m.nom}${m.prenom}`, { nom: m.nom as string, prenom: m.prenom }])).values(),
    );
    const inscriptionsHomonymes = pairesNomPrenom.length
      ? await this.prisma.mouvementCaisse.findMany({
          where: { inscriptionParentId: null, type: TypeMouvement.GAGNE, OR: pairesNomPrenom },
          orderBy: { date: 'desc' },
          select: {
            id: true,
            nom: true,
            prenom: true,
            date: true,
            numeroRecu: true,
            filieresInscrites: { select: { filiere: { select: { nom: true } } } },
          },
        })
      : [];

    const itemsAvecRenouvellements = items.map((m) => {
      const autresInscriptions = inscriptionsHomonymes
        .filter((h) => h.id !== m.id && h.nom === m.nom && h.prenom === m.prenom)
        .map((h) => ({
          id: h.id,
          date: h.date,
          numeroRecu: h.numeroRecu,
          filieres: h.filieresInscrites.map((fi) => fi.filiere.nom),
        }));
      return { ...m, autresInscriptions };
    });

    return { items: itemsAvecRenouvellements, total, page, limit };
  }

  private async compterInscriptionsParNomPrenom(records: { nom: string | null; prenom: string | null }[]) {
    const paires = Array.from(
      new Map(records.map((r) => [`${r.nom}${r.prenom}`, { nom: r.nom as string, prenom: r.prenom }])).values(),
    );
    if (!paires.length) return new Map<string, number>();
    const groupes = await this.prisma.mouvementCaisse.groupBy({
      by: ['nom', 'prenom'],
      where: { inscriptionParentId: null, type: TypeMouvement.GAGNE, OR: paires },
      _count: { _all: true },
    });
    return new Map(groupes.map((g) => [`${g.nom}${g.prenom}`, g._count._all]));
  }

  async resumeEtudiantsAdmin(query: QueryEtudiantsDto) {
    const where = this.whereEtudiantsAdmin(query);
    const records = await this.prisma.mouvementCaisse.findMany({
      where,
      select: { id: true, nom: true, prenom: true, montant: true, montantTotal: true, paiementsComplementaires: { select: { montant: true } } },
    });

    let payeCount = 0;
    let resteAPayerCount = 0;
    for (const r of records) {
      if (r.montantTotal === null) continue;
      const paye = r.montant + r.paiementsComplementaires.reduce((s, p) => s + p.montant, 0);
      const restant = Math.max(0, r.montantTotal - paye);
      if (restant <= 0) payeCount++;
      else resteAPayerCount++;
    }

    const compte = await this.compterInscriptionsParNomPrenom(records);
    const renouvellementsCount = records.filter((r) => (compte.get(`${r.nom}${r.prenom}`) ?? 1) > 1).length;

    return { total: records.length, payeCount, resteAPayerCount, renouvellementsCount };
  }

  // Nombre d'étudiants inscrits par filière, selon les mêmes filtres (période, point de vente,
  // secrétaire, recherche) que la liste — sert au filtre "Filières" de la vue admin.
  async countParFiliereAdmin(query: QueryEtudiantsDto) {
    const where = this.whereEtudiantsAdmin(query);
    const groupes = await this.prisma.inscriptionFiliere.groupBy({
      by: ['filiereId'],
      where: { mouvement: where },
      _count: { _all: true },
    });
    const filieres = await this.prisma.filiere.findMany({
      where: { id: { in: groupes.map((g) => g.filiereId) } },
      select: { id: true, nom: true },
    });
    const filiereNomParId = new Map(filieres.map((f) => [f.id, f.nom]));

    return groupes
      .map((g) => ({ filiereId: g.filiereId, filiereNom: filiereNomParId.get(g.filiereId) ?? '—', total: g._count._all }))
      .sort((a, b) => b.total - a.total);
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
