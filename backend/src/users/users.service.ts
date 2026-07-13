import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private userSelect = {
    id: true,
    nom: true,
    prenom: true,
    email: true,
    telephone: true,
    role: true,
    emailVerifiedAt: true,
    createdAt: true,
    profil: true,
  };

  async findMe(userId: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const { nom, prenom, ...profilFields } = dto;
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        ...(nom && { nom }),
        ...(prenom && { prenom }),
        profil: {
          upsert: {
            create: {
              ...profilFields,
              dateNaissance: profilFields.dateNaissance ? new Date(profilFields.dateNaissance) : undefined,
            },
            update: {
              ...profilFields,
              dateNaissance: profilFields.dateNaissance ? new Date(profilFields.dateNaissance) : undefined,
            },
          },
        },
      },
    });
    return this.findMe(userId);
  }

  async getCvSuggestion(userId: string) {
    const latestResult = await this.prisma.resultatOrientation.findFirst({
      where: { utilisateurId: userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestResult) {
      return {
        titreCv: 'Mon Projet Professionnel',
        bio: 'Étudiant motivé et désireux de développer des compétences professionnelles.',
        competences: [],
        langues: [],
        experiences: [],
        formations: [],
      };
    }

    const { profilDominant, metiersRecommandes } = latestResult as any;

    const firstMetierRecommendation = metiersRecommandes?.[0];
    let metierDetails = null;
    if (firstMetierRecommendation?.id) {
      metierDetails = await this.prisma.metier.findUnique({
        where: { id: firstMetierRecommendation.id },
      });
    }

    const titreCv = metierDetails ? `Futur ${metierDetails.nom}` : (firstMetierRecommendation?.nom || 'Mon Projet Professionnel');

    const riasecLabels: Record<string, string> = {
      R: 'Réaliste (concret et technique)',
      I: 'Investigateur (analytique et chercheur)',
      A: 'Artistique (créatif et original)',
      S: 'Social (relationnel et d’aide)',
      E: 'Entreprenant (décideur et meneur d’équipe)',
      C: 'Conventionnel (méthodique et organisé)',
    };

    let riasecText = '';
    if (profilDominant) {
      const letters = profilDominant.split('');
      const labels = letters.map((l: string) => riasecLabels[l] || l).join(', ');
      riasecText = ` avec un profil d'orientation à dominante ${labels}`;
    }

    const metierText = metierDetails ? ` le métier de ${metierDetails.nom}` : 'mes métiers cibles';
    const bio = `Actuellement en démarche d'orientation professionnelle${riasecText}, je souhaite développer mon parcours vers${metierText}. Rigoureux, motivé et curieux, je recherche des opportunités pour mettre en pratique mes compétences et participer à des projets stimulants.`;

    let competences: string[] = [];
    if (metierDetails) {
      const technicalComp = Array.isArray(metierDetails.competences)
        ? (metierDetails.competences as string[])
        : [];
      const behavioralComp = Array.isArray(metierDetails.competencesComportementales)
        ? (metierDetails.competencesComportementales as string[])
        : [];
      competences = [...new Set([...technicalComp, ...behavioralComp])];
    }

    let langues: string[] = [];
    if (metierDetails && Array.isArray(metierDetails.languesRequises)) {
      langues = metierDetails.languesRequises as string[];
    }

    return {
      titreCv,
      bio,
      competences,
      langues: langues.map((l) => ({ langue: l, niveau: 'Intermédiaire' })),
      experiences: [
        {
          poste: 'Stage d\'observation / Premier projet',
          entreprise: 'Exemple d\'entreprise ou projet académique',
          description: `Mise en application pratique dans le domaine de ${metierDetails?.nom || 'mon orientation'}.`,
          dateDebut: '',
          dateFin: '',
        },
      ],
      formations: [
        {
          diplome: metierDetails?.niveauRequis || 'Baccalauréat / Diplôme universitaire',
          ecole: metierDetails?.formationsMadagascar?.[0] || 'Lycée / Université',
          description: `Formation académique en lien avec ${metierDetails?.specialiteDiplome || 'mon projet professionnel'}.`,
          dateDebut: '',
          dateFin: '',
        },
      ],
    };
  }

  async findAll(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.utilisateur.findMany({
        select: this.userSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.utilisateur.count(),
    ]);
    return { items, total, page, limit };
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.utilisateur.update({
      where: { id },
      data: { role },
      select: this.userSelect,
    });
  }

  async remove(id: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.prisma.utilisateur.delete({ where: { id } });
    return { message: 'Utilisateur supprime' };
  }

  async countAll() {
    return this.prisma.utilisateur.count();
  }
}
