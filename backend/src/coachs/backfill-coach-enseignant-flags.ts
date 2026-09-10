import { PrismaService } from '../prisma/prisma.service';

// Comble estCoach/estEnseignant pour les comptes ayant déjà un profil Coach/Enseignant lié, créé
// avant l'introduction de ces indicateurs (capacité de créer plusieurs profils, comme pour les
// établissements). Exécuté à chaque démarrage : ne fait rien une fois les comptes à jour.
export async function backfillCoachEnseignantFlags(prisma: PrismaService): Promise<void> {
  const coachsSansFlag = await prisma.coach.findMany({
    where: { utilisateurId: { not: null }, utilisateur: { estCoach: false } },
    select: { utilisateurId: true },
    distinct: ['utilisateurId'],
  });
  for (const c of coachsSansFlag) {
    if (c.utilisateurId) {
      await prisma.utilisateur.update({ where: { id: c.utilisateurId }, data: { estCoach: true } });
    }
  }

  const enseignantsSansFlag = await prisma.enseignant.findMany({
    where: { utilisateurId: { not: null }, utilisateur: { estEnseignant: false } },
    select: { utilisateurId: true },
    distinct: ['utilisateurId'],
  });
  for (const e of enseignantsSansFlag) {
    if (e.utilisateurId) {
      await prisma.utilisateur.update({ where: { id: e.utilisateurId }, data: { estEnseignant: true } });
    }
  }
}
