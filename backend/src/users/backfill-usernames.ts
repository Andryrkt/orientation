import { PrismaService } from '../prisma/prisma.service';
import { generateUniqueUsername } from '../common/utils/unique-username';

// Comble le nom d'utilisateur des comptes créés avant l'introduction de ce champ. Exécuté à
// chaque démarrage : ne fait rien si tous les comptes ont déjà un username (requête vide).
export async function backfillUsernames(prisma: PrismaService): Promise<void> {
  const usersWithoutUsername = await prisma.utilisateur.findMany({
    where: { username: null },
    select: { id: true, nom: true },
    orderBy: { createdAt: 'asc' },
  });
  for (const user of usersWithoutUsername) {
    const username = await generateUniqueUsername(prisma, user.nom);
    await prisma.utilisateur.update({ where: { id: user.id }, data: { username } });
  }
}
