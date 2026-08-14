import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeanceCoursDto } from './dto/create-seance-cours.dto';
import { UpdateSeanceCoursDto } from './dto/update-seance-cours.dto';

@Injectable()
export class EmploiDuTempsService {
  constructor(private prisma: PrismaService) {}

  private include = {
    filieres: { select: { id: true, nom: true } },
    enseignant: { select: { id: true, nom: true, prenom: true } },
    salle: { select: { id: true, nom: true, capacite: true } },
  };

  async findAll(filiereId?: string, enseignantId?: string) {
    const items = await this.prisma.seanceCours.findMany({
      where: {
        ...(filiereId ? { filieres: { some: { id: filiereId } } } : {}),
        ...(enseignantId ? { enseignantId } : {}),
      },
      orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
      include: this.include,
    });
    return { items, total: items.length, page: 1, limit: items.length || 100 };
  }

  // Deux créneaux [debut1,fin1) et [debut2,fin2) se chevauchent si debut1 < fin2 ET debut2 < fin1 —
  // vrai aussi en comparaison de chaînes "HH:mm" puisqu'elles sont toujours au même format à 5
  // caractères (comparaison lexicographique = comparaison numérique de l'heure).
  private async verifierConflits(dto: CreateSeanceCoursDto, ignorerId?: string) {
    if (dto.heureFin <= dto.heureDebut) {
      throw new BadRequestException("L'heure de fin doit être après l'heure de début");
    }

    const memeJour = await this.prisma.seanceCours.findMany({
      where: {
        jour: dto.jour,
        id: ignorerId ? { not: ignorerId } : undefined,
        OR: [{ enseignantId: dto.enseignantId }, { salleId: dto.salleId }],
      },
      include: this.include,
    });

    const chevauche = (s: { heureDebut: string; heureFin: string }) => dto.heureDebut < s.heureFin && s.heureDebut < dto.heureFin;

    const conflitEnseignant = memeJour.find((s) => s.enseignantId === dto.enseignantId && chevauche(s));
    if (conflitEnseignant) {
      throw new ConflictException(
        `${conflitEnseignant.enseignant.prenom} ${conflitEnseignant.enseignant.nom} a déjà un cours ce jour-là de ${conflitEnseignant.heureDebut} à ${conflitEnseignant.heureFin} (${conflitEnseignant.matiere})`,
      );
    }
    const conflitSalle = memeJour.find((s) => s.salleId === dto.salleId && chevauche(s));
    if (conflitSalle) {
      throw new ConflictException(
        `La salle "${conflitSalle.salle.nom}" est déjà occupée ce jour-là de ${conflitSalle.heureDebut} à ${conflitSalle.heureFin} (${conflitSalle.matiere})`,
      );
    }
  }

  async create(dto: CreateSeanceCoursDto) {
    await this.verifierConflits(dto);
    return this.prisma.seanceCours.create({
      data: {
        matiere: dto.matiere,
        enseignantId: dto.enseignantId,
        jour: dto.jour,
        heureDebut: dto.heureDebut,
        heureFin: dto.heureFin,
        salleId: dto.salleId,
        filieres: { connect: dto.filiereIds.map((id) => ({ id })) },
      },
      include: this.include,
    });
  }

  async findOne(id: string) {
    const seance = await this.prisma.seanceCours.findUnique({ where: { id }, include: this.include });
    if (!seance) throw new NotFoundException(`Séance #${id} introuvable`);
    return seance;
  }

  async update(id: string, dto: UpdateSeanceCoursDto) {
    const existante = await this.findOne(id);
    const fusionne: CreateSeanceCoursDto = {
      matiere: dto.matiere ?? existante.matiere,
      filiereIds: dto.filiereIds ?? existante.filieres.map((f) => f.id),
      enseignantId: dto.enseignantId ?? existante.enseignantId,
      jour: dto.jour ?? existante.jour,
      heureDebut: dto.heureDebut ?? existante.heureDebut,
      heureFin: dto.heureFin ?? existante.heureFin,
      salleId: dto.salleId ?? existante.salleId,
    };
    await this.verifierConflits(fusionne, id);
    return this.prisma.seanceCours.update({
      where: { id },
      data: {
        matiere: fusionne.matiere,
        enseignantId: fusionne.enseignantId,
        jour: fusionne.jour,
        heureDebut: fusionne.heureDebut,
        heureFin: fusionne.heureFin,
        salleId: fusionne.salleId,
        filieres: { set: fusionne.filiereIds.map((fid) => ({ id: fid })) },
      },
      include: this.include,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.seanceCours.delete({ where: { id } });
  }
}
