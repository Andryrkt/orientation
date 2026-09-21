// Script ponctuel : supprime l'ancienne fiche "Architecte" (créée le 2026-08-20, hors guide)
// et renomme le slug de la nouvelle fiche (issue du guide) sur le slug canonique "architecte".
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const old = await prisma.metier.findUnique({ where: { slug: 'architecte' } });
  if (old) {
    await prisma.metier.delete({ where: { id: old.id } });
    console.log(`Supprimé: ancienne fiche Architecte (${old.id})`);
  } else {
    console.log('Ancienne fiche "architecte" introuvable — rien à supprimer.');
  }

  const guide = await prisma.metier.findUnique({ where: { slug: 'architecte-1' } });
  if (guide) {
    await prisma.metier.update({ where: { id: guide.id }, data: { slug: 'architecte' } });
    console.log(`Renommé: architecte-1 -> architecte (${guide.id})`);
  } else {
    console.log('Fiche "architecte-1" introuvable — rien à renommer.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
