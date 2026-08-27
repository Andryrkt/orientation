import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRendezVousDto } from './dto/create-rendez-vous.dto';
import { UpdateRendezVousDto } from './dto/update-rendez-vous.dto';
import { QueryRendezVousDto } from './dto/query-rendez-vous.dto';

const DEMANDEUR_SELECT = { select: { id: true, nom: true, prenom: true, email: true, telephone: true } };
const COACH_SELECT = { select: { id: true, nom: true, prenom: true, photo: true } };
const ENSEIGNANT_SELECT = { select: { id: true, nom: true, prenom: true, photo: true } };

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRME: 'Confirmé',
  ANNULE: 'Décliné',
  TERMINE: 'Terminé',
};

@Injectable()
export class RendezVousService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
    private config: ConfigService,
  ) {}

  private frontendOrigin() {
    return this.config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:5173';
  }

  private formatDate(date: Date) {
    return date.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
  }

  async create(utilisateurId: string, dto: CreateRendezVousDto) {
    let coach: { nom: string; prenom: string; email: string | null; utilisateurId: string | null } | null = null;
    let enseignant: { nom: string; prenom: string; email: string | null; utilisateurId: string | null } | null = null;

    if (dto.cible === 'COACH') {
      if (!dto.coachId) throw new BadRequestException('coachId requis pour une demande à un coach');
      coach = await this.prisma.coach.findUnique({ where: { id: dto.coachId } });
      if (!coach) throw new NotFoundException('Coach introuvable');
    } else {
      if (!dto.enseignantId) throw new BadRequestException('enseignantId requis pour une demande à un enseignant');
      enseignant = await this.prisma.enseignant.findUnique({ where: { id: dto.enseignantId } });
      if (!enseignant) throw new NotFoundException('Enseignant introuvable');
    }

    const rdv = await this.prisma.rendezVous.create({
      data: {
        utilisateurId,
        cible: dto.cible,
        coachId: dto.cible === 'COACH' ? dto.coachId : undefined,
        enseignantId: dto.cible === 'ENSEIGNANT' ? dto.enseignantId : undefined,
        dateSouhaitee: new Date(dto.dateSouhaitee),
        message: dto.message,
      },
    });

    const destinataire = coach ?? enseignant;
    if (destinataire) {
      const demandeur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
      if (demandeur) {
        const demandeurNom = `${demandeur.prenom} ${demandeur.nom}`;

        if (destinataire.email) {
          this.mailService
            .sendRendezVousDemande(destinataire.email, {
              destinataireNom: `${destinataire.prenom} ${destinataire.nom}`,
              demandeurNom,
              dateSouhaitee: this.formatDate(rdv.dateSouhaitee),
              message: rdv.message,
              lienEspace: `${this.frontendOrigin()}/rendez-vous-a-traiter`,
            })
            .catch(() => undefined);
        }

        if (destinataire.utilisateurId) {
          this.notificationsService
            .create({
              utilisateurId: destinataire.utilisateurId,
              type: 'RENDEZ_VOUS_DEMANDE',
              titre: 'Nouvelle demande de rendez-vous',
              message: `${demandeurNom} souhaite un rendez-vous le ${this.formatDate(rdv.dateSouhaitee)}.`,
              lien: '/rendez-vous-a-traiter',
            })
            .catch(() => undefined);
        }
      }
    }

    return rdv;
  }

  async findAll(utilisateurId: string, role: Role, query: QueryRendezVousDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.RendezVousWhereInput = {};

    if (query.vue === 'a-traiter') {
      if (role === Role.COACH) {
        const coach = await this.prisma.coach.findFirst({ where: { utilisateurId } });
        where.coachId = coach?.id ?? '__aucun__';
      } else if (role === Role.TEACHER) {
        const enseignant = await this.prisma.enseignant.findFirst({ where: { utilisateurId } });
        where.enseignantId = enseignant?.id ?? '__aucun__';
      } else {
        throw new ForbiddenException('Réservé aux coachs et enseignants');
      }
    } else {
      where.utilisateurId = utilisateurId;
    }

    if (query.statut) {
      where.statut = query.statut;
    }

    const [items, total] = await Promise.all([
      this.prisma.rendezVous.findMany({
        where,
        include: { utilisateur: DEMANDEUR_SELECT, coach: COACH_SELECT, enseignant: ENSEIGNANT_SELECT },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rendezVous.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findAllAdmin(query: QueryRendezVousDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.RendezVousWhereInput = {};
    if (query.statut) where.statut = query.statut;

    const [items, total] = await Promise.all([
      this.prisma.rendezVous.findMany({
        where,
        include: { utilisateur: DEMANDEUR_SELECT, coach: COACH_SELECT, enseignant: ENSEIGNANT_SELECT },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rendezVous.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  private async resolveResponsable(utilisateurId: string, role: Role, rdv: { coachId: string | null; enseignantId: string | null }) {
    if (role === Role.COACH && rdv.coachId) {
      const coach = await this.prisma.coach.findFirst({ where: { utilisateurId, id: rdv.coachId } });
      return !!coach;
    }
    if (role === Role.TEACHER && rdv.enseignantId) {
      const enseignant = await this.prisma.enseignant.findFirst({ where: { utilisateurId, id: rdv.enseignantId } });
      return !!enseignant;
    }
    return false;
  }

  async update(id: string, utilisateurId: string, role: Role, dto: UpdateRendezVousDto) {
    const rdv = await this.prisma.rendezVous.findUnique({ where: { id } });
    if (!rdv) throw new NotFoundException('Rendez-vous introuvable');

    const isAdmin = role === Role.ADMIN || role === Role.MODERATEUR;
    const isDemandeur = rdv.utilisateurId === utilisateurId;
    const isResponsable = !isAdmin && (await this.resolveResponsable(utilisateurId, role, rdv));

    if (isAdmin) {
      return this.prisma.rendezVous.update({
        where: { id },
        data: {
          ...dto,
          dateSouhaitee: dto.dateSouhaitee ? new Date(dto.dateSouhaitee) : undefined,
        },
      });
    }

    if (isResponsable) {
      const allowedKeys = new Set(['statut', 'reponse']);
      if (Object.keys(dto).some((key) => !allowedKeys.has(key))) {
        throw new ForbiddenException('Vous ne pouvez modifier que le statut et votre réponse');
      }
      const updated = await this.prisma.rendezVous.update({ where: { id }, data: dto });

      if (dto.statut && dto.statut !== rdv.statut) {
        const [demandeur, destinataire] = await Promise.all([
          this.prisma.utilisateur.findUnique({ where: { id: rdv.utilisateurId } }),
          rdv.coachId
            ? this.prisma.coach.findUnique({ where: { id: rdv.coachId } })
            : rdv.enseignantId
              ? this.prisma.enseignant.findUnique({ where: { id: rdv.enseignantId } })
              : null,
        ]);
        if (demandeur && destinataire) {
          const statutLabel = STATUT_LABELS[dto.statut] ?? dto.statut;
          const destinataireNom = `${destinataire.prenom} ${destinataire.nom}`;

          if (demandeur.email) {
            this.mailService
              .sendRendezVousReponse(demandeur.email, {
                demandeurNom: `${demandeur.prenom} ${demandeur.nom}`,
                destinataireNom,
                statut: statutLabel,
                reponse: updated.reponse,
                lienEspace: `${this.frontendOrigin()}/mes-rendez-vous`,
              })
              .catch(() => undefined);
          }

          this.notificationsService
            .create({
              utilisateurId: demandeur.id,
              type: 'RENDEZ_VOUS_REPONSE',
              titre: 'Réponse à votre demande de rendez-vous',
              message: `${destinataireNom} a répondu à votre demande : ${statutLabel}.`,
              lien: '/mes-rendez-vous',
            })
            .catch(() => undefined);
        }
      }

      return updated;
    }

    if (isDemandeur) {
      const allowedKeys = new Set(['statut']);
      if (dto.statut !== 'ANNULE' || Object.keys(dto).some((key) => !allowedKeys.has(key))) {
        throw new ForbiddenException('Vous ne pouvez qu\'annuler votre propre demande');
      }
      if (rdv.statut !== 'EN_ATTENTE') {
        throw new BadRequestException('Cette demande a déjà été traitée');
      }
      return this.prisma.rendezVous.update({ where: { id }, data: { statut: 'ANNULE' } });
    }

    throw new ForbiddenException("Vous n'avez pas l'autorisation de modifier ce rendez-vous");
  }

  async remove(id: string) {
    const rdv = await this.prisma.rendezVous.findUnique({ where: { id } });
    if (!rdv) throw new NotFoundException('Rendez-vous introuvable');
    await this.prisma.rendezVous.delete({ where: { id } });
    return { message: 'Rendez-vous supprimé' };
  }

  countAll() {
    return this.prisma.rendezVous.count();
  }
}
