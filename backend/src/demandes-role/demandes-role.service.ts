import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DemandeRoleStatut, DemandeRoleType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDemandeRoleDto } from './dto/create-demande-role.dto';
import { UpdateDemandeRoleDto } from './dto/update-demande-role.dto';
import { ResubmitDemandeRoleDto } from './dto/resubmit-demande-role.dto';
import { QueryDemandeRoleDto } from './dto/query-demande-role.dto';

const AUTEUR_SELECT = { select: { id: true, nom: true, prenom: true, email: true } };

const TYPE_LABELS: Record<DemandeRoleType, string> = {
  COACH: 'coach',
  ENSEIGNANT: 'enseignant',
  ETUDIANT: 'étudiant',
  GESTIONNAIRE_ETABLISSEMENT: "gestionnaire d'établissement",
};

@Injectable()
export class DemandesRoleService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(utilisateurId: string, dto: CreateDemandeRoleDto) {
    const dejaProfil = await this.aDejaLeStatut(utilisateurId, dto.type);
    if (dejaProfil) {
      throw new ConflictException(`Vous avez déjà le statut ${TYPE_LABELS[dto.type]}`);
    }

    const demandeEnCours = await this.prisma.demandeRole.findFirst({
      where: {
        utilisateurId,
        type: dto.type,
        statut: { in: [DemandeRoleStatut.EN_ATTENTE, DemandeRoleStatut.CLARIFICATION_DEMANDEE] },
      },
    });
    if (demandeEnCours) {
      throw new ConflictException(`Une demande ${TYPE_LABELS[dto.type]} est déjà en cours`);
    }

    const demande = await this.prisma.demandeRole.create({
      data: {
        utilisateurId,
        type: dto.type,
        message: dto.message,
        telephone: dto.telephone,
        bio: dto.bio,
        disponibilites: dto.disponibilites,
        specialites: dto.type === DemandeRoleType.COACH ? (dto.specialites ?? []) : [],
        experience: dto.type === DemandeRoleType.COACH ? dto.experience : undefined,
        matieres: dto.type === DemandeRoleType.ENSEIGNANT ? (dto.matieres ?? []) : [],
        niveauxEtude: dto.type === DemandeRoleType.ENSEIGNANT ? (dto.niveauxEtude ?? []) : [],
        etablissement: dto.type === DemandeRoleType.ENSEIGNANT ? dto.etablissement : undefined,
        niveauEtude: dto.type === DemandeRoleType.ETUDIANT ? dto.niveauEtude : undefined,
      },
    });

    const admins = await this.prisma.utilisateur.findMany({ where: { role: Role.ADMIN }, select: { id: true } });
    const demandeur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (demandeur) {
      await Promise.all(
        admins.map((admin) =>
          this.notificationsService.create({
            utilisateurId: admin.id,
            type: 'DEMANDE_ROLE',
            titre: 'Nouvelle demande de statut',
            message: `${demandeur.prenom} ${demandeur.nom} souhaite devenir ${TYPE_LABELS[dto.type]}.`,
            lien: '/admin/demandes-role',
          }),
        ),
      );
    }

    return demande;
  }

  private async aDejaLeStatut(utilisateurId: string, type: DemandeRoleType): Promise<boolean> {
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (type === DemandeRoleType.COACH) {
      return !!utilisateur?.estCoach;
    }
    if (type === DemandeRoleType.ENSEIGNANT) {
      return !!utilisateur?.estEnseignant;
    }
    if (type === DemandeRoleType.GESTIONNAIRE_ETABLISSEMENT) {
      return !!utilisateur?.estGestionnaireEtablissement;
    }
    return !!utilisateur?.estEtudiantValide;
  }

  findMine(utilisateurId: string) {
    return this.prisma.demandeRole.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMine(utilisateurId: string, id: string, dto: ResubmitDemandeRoleDto) {
    const demande = await this.prisma.demandeRole.findUnique({ where: { id } });
    if (!demande) throw new NotFoundException('Demande introuvable');
    if (demande.utilisateurId !== utilisateurId) throw new ForbiddenException();
    if (demande.statut !== DemandeRoleStatut.CLARIFICATION_DEMANDEE) {
      throw new BadRequestException('Cette demande ne nécessite pas de complément pour le moment');
    }

    const updated = await this.prisma.demandeRole.update({
      where: { id },
      data: {
        message: dto.message ?? demande.message,
        telephone: dto.telephone ?? demande.telephone,
        bio: dto.bio ?? demande.bio,
        disponibilites: dto.disponibilites ?? demande.disponibilites,
        specialites: demande.type === DemandeRoleType.COACH ? (dto.specialites ?? demande.specialites) : [],
        experience: demande.type === DemandeRoleType.COACH ? (dto.experience ?? demande.experience) : undefined,
        matieres: demande.type === DemandeRoleType.ENSEIGNANT ? (dto.matieres ?? demande.matieres) : [],
        niveauxEtude: demande.type === DemandeRoleType.ENSEIGNANT ? (dto.niveauxEtude ?? demande.niveauxEtude) : [],
        etablissement: demande.type === DemandeRoleType.ENSEIGNANT ? (dto.etablissement ?? demande.etablissement) : undefined,
        niveauEtude: demande.type === DemandeRoleType.ETUDIANT ? (dto.niveauEtude ?? demande.niveauEtude) : undefined,
        statut: DemandeRoleStatut.EN_ATTENTE,
        reponse: null,
      },
    });

    const demandeur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    const admins = await this.prisma.utilisateur.findMany({ where: { role: Role.ADMIN }, select: { id: true } });
    if (demandeur) {
      await Promise.all(
        admins.map((admin) =>
          this.notificationsService.create({
            utilisateurId: admin.id,
            type: 'DEMANDE_ROLE',
            titre: 'Demande complétée',
            message: `${demandeur.prenom} ${demandeur.nom} a complété sa demande pour devenir ${TYPE_LABELS[demande.type]}.`,
            lien: '/admin/demandes-role',
          }),
        ),
      );
    }

    return updated;
  }

  async findAllAdmin(query: QueryDemandeRoleDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.DemandeRoleWhereInput = { ...(query.statut && { statut: query.statut }) };

    const [items, total] = await Promise.all([
      this.prisma.demandeRole.findMany({
        where,
        include: { utilisateur: AUTEUR_SELECT },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.demandeRole.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async resolve(id: string, dto: UpdateDemandeRoleDto) {
    const demande = await this.prisma.demandeRole.findUnique({ where: { id } });
    if (!demande) throw new NotFoundException('Demande introuvable');

    // Une demande refusée reste réexaminable (ex. refus fait par erreur) : l'admin peut encore
    // l'approuver ou demander un complément. Une demande déjà approuvée ne peut, elle, être remise
    // qu'"en attente" (pour repasser ensuite par le circuit normal) — pas directement réapprouvée
    // ou refusée, pour garder une étape de confirmation explicite.
    const transitionsAutorisees: Record<DemandeRoleStatut, DemandeRoleStatut[]> = {
      [DemandeRoleStatut.EN_ATTENTE]: [
        DemandeRoleStatut.APPROUVEE,
        DemandeRoleStatut.REJETEE,
        DemandeRoleStatut.CLARIFICATION_DEMANDEE,
      ],
      [DemandeRoleStatut.REJETEE]: [
        DemandeRoleStatut.APPROUVEE,
        DemandeRoleStatut.REJETEE,
        DemandeRoleStatut.CLARIFICATION_DEMANDEE,
      ],
      [DemandeRoleStatut.APPROUVEE]: [DemandeRoleStatut.EN_ATTENTE],
      [DemandeRoleStatut.CLARIFICATION_DEMANDEE]: [],
    };
    if (!transitionsAutorisees[demande.statut].includes(dto.statut)) {
      throw new BadRequestException('Cette transition n\'est pas autorisée pour cette demande');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: demande.utilisateurId } });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable');

    if (dto.statut === DemandeRoleStatut.CLARIFICATION_DEMANDEE && !dto.reponse?.trim()) {
      throw new BadRequestException('Précisez ce qui doit être complété ou clarifié');
    }

    if (dto.statut === DemandeRoleStatut.APPROUVEE) {
      if (demande.type === DemandeRoleType.COACH) {
        // Ne crée aucun profil automatiquement : le coach crée lui-même autant de profils qu'il
        // veut (ex: coach sportif, coach en orientation) dans son espace, chacun soumis à
        // validation admin — comme pour les établissements.
        await this.prisma.utilisateur.update({
          where: { id: utilisateur.id },
          data: { estCoach: true },
        });
      } else if (demande.type === DemandeRoleType.ENSEIGNANT) {
        await this.prisma.utilisateur.update({
          where: { id: utilisateur.id },
          data: { estEnseignant: true },
        });
      } else if (demande.type === DemandeRoleType.GESTIONNAIRE_ETABLISSEMENT) {
        await this.prisma.utilisateur.update({
          where: { id: utilisateur.id },
          data: { estGestionnaireEtablissement: true },
        });
      } else {
        await this.prisma.utilisateur.update({
          where: { id: utilisateur.id },
          data: { estEtudiantValide: true },
        });
        if (demande.niveauEtude) {
          await this.prisma.profil.upsert({
            where: { utilisateurId: utilisateur.id },
            update: { niveauEtude: demande.niveauEtude },
            create: { utilisateurId: utilisateur.id, niveauEtude: demande.niveauEtude },
          });
        }
      }
    } else if (demande.statut === DemandeRoleStatut.APPROUVEE && dto.statut === DemandeRoleStatut.EN_ATTENTE) {
      // Remettre en attente une demande déjà approuvée retire l'accès accordé — sinon "Mon espace"
      // continuerait d'afficher le statut débloqué alors que la demande est de nouveau en cours
      // d'examen. Les profils Coach/Enseignant déjà créés ne sont pas supprimés ni déliés (avis,
      // rendez-vous liés) : seule la capacité d'en créer/modifier de nouveaux est retirée.
      if (demande.type === DemandeRoleType.COACH) {
        await this.prisma.utilisateur.update({ where: { id: utilisateur.id }, data: { estCoach: false } });
      } else if (demande.type === DemandeRoleType.ENSEIGNANT) {
        await this.prisma.utilisateur.update({ where: { id: utilisateur.id }, data: { estEnseignant: false } });
      } else if (demande.type === DemandeRoleType.GESTIONNAIRE_ETABLISSEMENT) {
        await this.prisma.utilisateur.update({
          where: { id: utilisateur.id },
          data: { estGestionnaireEtablissement: false },
        });
      } else {
        await this.prisma.utilisateur.update({
          where: { id: utilisateur.id },
          data: { estEtudiantValide: false },
        });
      }
    }

    const updated = await this.prisma.demandeRole.update({
      where: { id },
      data: { statut: dto.statut, reponse: dto.reponse },
    });

    const messages: Record<(typeof dto)['statut'], { titre: string; message: string }> = {
      [DemandeRoleStatut.EN_ATTENTE]: {
        titre: 'Demande remise en attente',
        message: `Votre demande pour devenir ${TYPE_LABELS[demande.type]} a été remise en attente pour réexamen.`,
      },
      [DemandeRoleStatut.APPROUVEE]: {
        titre: 'Demande approuvée',
        message: `Votre demande pour devenir ${TYPE_LABELS[demande.type]} a été approuvée ! Rendez-vous dans "Mon espace".`,
      },
      [DemandeRoleStatut.REJETEE]: {
        titre: 'Demande refusée',
        message: `Votre demande pour devenir ${TYPE_LABELS[demande.type]} a été refusée.${dto.reponse ? ` Motif : ${dto.reponse}` : ''}`,
      },
      [DemandeRoleStatut.CLARIFICATION_DEMANDEE]: {
        titre: 'Complément demandé',
        message: `Un complément d'information est nécessaire pour votre demande "${TYPE_LABELS[demande.type]}" : ${dto.reponse}`,
      },
    };

    await this.notificationsService.create({
      utilisateurId: utilisateur.id,
      type: 'DEMANDE_ROLE_REPONSE',
      titre: messages[dto.statut].titre,
      message: messages[dto.statut].message,
      lien: '/mon-espace',
    });

    return updated;
  }

  countPending() {
    return this.prisma.demandeRole.count({ where: { statut: DemandeRoleStatut.EN_ATTENTE } });
  }
}
