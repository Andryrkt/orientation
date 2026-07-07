import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TypeQuestion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateReponseDto } from './dto/create-reponse.dto';
import { UpdateReponseDto } from './dto/update-reponse.dto';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import { addScores, emptyScores, topCodes } from './riasec';

@Injectable()
export class QuestionnairesService {
  constructor(private prisma: PrismaService) {}

  findAllActive() {
    return this.prisma.questionnaire.findMany({
      where: { actif: true },
      select: { id: true, titre: true, description: true, type: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOneForTaking(id: string) {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { ordre: 'asc' },
          select: {
            id: true,
            texte: true,
            type: true,
            ordre: true,
            reponses: {
              orderBy: { ordre: 'asc' },
              select: { id: true, texte: true, ordre: true },
            },
          },
        },
      },
    });
    if (!questionnaire || !questionnaire.actif) throw new NotFoundException('Questionnaire introuvable');
    return questionnaire;
  }

  findAllAdmin() {
    return this.prisma.questionnaire.findMany({
      include: { _count: { select: { questions: true, resultats: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAdmin(id: string) {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { ordre: 'asc' },
          include: { reponses: { orderBy: { ordre: 'asc' } } },
        },
      },
    });
    if (!questionnaire) throw new NotFoundException('Questionnaire introuvable');
    return questionnaire;
  }

  create(dto: CreateQuestionnaireDto) {
    return this.prisma.questionnaire.create({ data: dto });
  }

  async update(id: string, dto: UpdateQuestionnaireDto) {
    const existing = await this.prisma.questionnaire.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Questionnaire introuvable');
    return this.prisma.questionnaire.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const existing = await this.prisma.questionnaire.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Questionnaire introuvable');
    const resultatsCount = await this.prisma.resultatOrientation.count({ where: { questionnaireId: id } });
    if (resultatsCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer un questionnaire pour lequel des utilisateurs ont deja des resultats. Desactive-le plutot.',
      );
    }
    await this.prisma.questionnaire.delete({ where: { id } });
    return { message: 'Questionnaire supprime' };
  }

  async createQuestion(dto: CreateQuestionDto) {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id: dto.questionnaireId },
    });
    if (!questionnaire) throw new NotFoundException('Questionnaire introuvable');
    return this.prisma.question.create({
      data: {
        questionnaireId: dto.questionnaireId,
        texte: dto.texte,
        type: dto.type,
        ordre: dto.ordre,
        scoreDimensions: dto.scoreDimensions ?? {},
      },
    });
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question introuvable');
    return this.prisma.question.update({
      where: { id },
      data: {
        ...(dto.texte !== undefined && { texte: dto.texte }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.ordre !== undefined && { ordre: dto.ordre }),
        ...(dto.scoreDimensions !== undefined && { scoreDimensions: dto.scoreDimensions }),
      },
    });
  }

  async removeQuestion(id: string) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question introuvable');
    await this.prisma.question.delete({ where: { id } });
    return { message: 'Question supprimee' };
  }

  async createReponse(dto: CreateReponseDto) {
    const question = await this.prisma.question.findUnique({ where: { id: dto.questionId } });
    if (!question) throw new NotFoundException('Question introuvable');
    return this.prisma.reponse.create({
      data: {
        questionId: dto.questionId,
        texte: dto.texte,
        score: dto.score ?? {},
        ordre: dto.ordre,
      },
    });
  }

  async updateReponse(id: string, dto: UpdateReponseDto) {
    const existing = await this.prisma.reponse.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Reponse introuvable');
    return this.prisma.reponse.update({
      where: { id },
      data: {
        ...(dto.texte !== undefined && { texte: dto.texte }),
        ...(dto.score !== undefined && { score: dto.score }),
        ...(dto.ordre !== undefined && { ordre: dto.ordre }),
      },
    });
  }

  async removeReponse(id: string) {
    const existing = await this.prisma.reponse.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Reponse introuvable');
    await this.prisma.reponse.delete({ where: { id } });
    return { message: 'Reponse supprimee' };
  }

  async submit(questionnaireId: string, userId: string, dto: SubmitQuestionnaireDto) {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: { questions: { include: { reponses: true } } },
    });
    if (!questionnaire || !questionnaire.actif) {
      throw new NotFoundException('Questionnaire introuvable');
    }

    const questionsById = new Map(questionnaire.questions.map((q) => [q.id, q]));
    const scores = emptyScores();
    const answersLog: Prisma.InputJsonValue[] = [];

    for (const answer of dto.reponses) {
      const question = questionsById.get(answer.questionId);
      if (!question) {
        throw new BadRequestException(`Question ${answer.questionId} n'appartient pas a ce questionnaire`);
      }

      if (question.type === TypeQuestion.CHOIX_MULTIPLE) {
        const reponse = question.reponses.find((r) => r.id === answer.reponseId);
        if (!reponse) {
          throw new BadRequestException(`Reponse invalide pour la question ${question.id}`);
        }
        addScores(scores, reponse.score as Record<string, number>);
        answersLog.push({ questionId: question.id, reponseId: reponse.id, texte: reponse.texte });
      } else if (question.type === TypeQuestion.ECHELLE) {
        const valeur = answer.valeurEchelle;
        if (valeur === undefined) {
          throw new BadRequestException(`Valeur d'echelle manquante pour la question ${question.id}`);
        }
        const weights = question.scoreDimensions as Record<string, number>;
        const weighted = Object.fromEntries(
          Object.entries(weights).map(([dim, weight]) => [dim, weight * valeur]),
        );
        addScores(scores, weighted);
        answersLog.push({ questionId: question.id, valeurEchelle: valeur });
      } else {
        answersLog.push({ questionId: question.id, texte: answer.texte ?? '' });
      }
    }

    const codes = topCodes(scores, 2);
    const profilDominant = codes.join('');

    const [domainesCandidats, metiersCandidats] = await Promise.all([
      this.prisma.domaine.findMany({
        where: { riasecCodes: { hasSome: codes } },
        select: { id: true, nom: true, slug: true, riasecCodes: true },
      }),
      this.prisma.metier.findMany({
        where: { riasecCodes: { hasSome: codes } },
        select: { id: true, nom: true, slug: true, riasecCodes: true },
      }),
    ]);

    const rank = <T extends { riasecCodes: string[] }>(items: T[]) =>
      items
        .map((item) => ({
          item,
          overlap: item.riasecCodes.filter((c) => codes.includes(c)).length,
        }))
        .sort((a, b) => b.overlap - a.overlap)
        .map(({ item }) => item);

    const domainesRecommandes = rank(domainesCandidats)
      .slice(0, 5)
      .map(({ id, nom, slug }) => ({ id, nom, slug }));
    const metiersRecommandes = rank(metiersCandidats)
      .slice(0, 6)
      .map(({ id, nom, slug }) => ({ id, nom, slug }));

    return this.prisma.resultatOrientation.create({
      data: {
        utilisateurId: userId,
        questionnaireId,
        scores,
        profilDominant,
        domainesRecommandes: domainesRecommandes as Prisma.InputJsonValue,
        metiersRecommandes: metiersRecommandes as Prisma.InputJsonValue,
        reponses: answersLog as Prisma.InputJsonValue,
      },
    });
  }

  findResultsForUser(userId: string) {
    return this.prisma.resultatOrientation.findMany({
      where: { utilisateurId: userId },
      include: { questionnaire: { select: { titre: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findResultForUser(userId: string, id: string) {
    const resultat = await this.prisma.resultatOrientation.findUnique({
      where: { id },
      include: { questionnaire: { select: { titre: true } } },
    });
    if (!resultat) throw new NotFoundException('Resultat introuvable');
    if (resultat.utilisateurId !== userId) throw new ForbiddenException();
    return resultat;
  }

  countAll() {
    return this.prisma.resultatOrientation.count();
  }
}
