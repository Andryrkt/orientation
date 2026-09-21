// Script ponctuel : ajoute des mentions et parcours d'exemple pour le domaine
// "Sciences et Technologies" de l'Université d'Antananarivo. N'écrit que ces
// mentions/parcours (upsert par slug), ne touche à rien d'autre.
// Usage : npx ts-node scripts/seed-mentions-sciences.ts
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/common/utils/slugify';

const prisma = new PrismaClient();

const UNIVERSITE_SLUG = 'universite-antananarivo';
const DOMAINE_SLUG = 'sciences-technologies';

const mentionsData = [
  {
    nom: 'Mathématique et Informatique',
    parcours: ['Mathématique appliquée', 'Mathématique fondamentale'],
  },
  {
    nom: 'Physique et Application',
    parcours: [
      'Physique nucléaire appliquée environnement',
      'Physique du solide',
      'Énergétique',
      'Rayonnement',
    ],
  },
  {
    nom: 'Science de la Vie et de la Terre',
    parcours: ['Biologie', 'Géologie'],
  },
];

async function uniqueSlug(model: 'mention' | 'parcours', nom: string) {
  const base = slugify(nom);
  let slug = base;
  let i = 1;
  while (
    model === 'mention'
      ? await prisma.mention.findUnique({ where: { slug } })
      : await prisma.parcours.findUnique({ where: { slug } })
  ) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

async function main() {
  const universite = await prisma.universite.findUnique({ where: { slug: UNIVERSITE_SLUG } });
  if (!universite) throw new Error(`Université introuvable: ${UNIVERSITE_SLUG}`);

  const domaine = await prisma.domaine.findUnique({ where: { slug: DOMAINE_SLUG } });
  if (!domaine) throw new Error(`Domaine introuvable: ${DOMAINE_SLUG}`);

  for (const m of mentionsData) {
    const existing = await prisma.mention.findFirst({
      where: { nom: m.nom, universiteId: universite.id, domaineId: domaine.id },
    });

    const mention =
      existing ??
      (await prisma.mention.create({
        data: {
          nom: m.nom,
          slug: await uniqueSlug('mention', m.nom),
          universiteId: universite.id,
          domaineId: domaine.id,
        },
      }));
    console.log(`Mention OK: ${mention.nom}`);

    for (const pNom of m.parcours) {
      const existingParcours = await prisma.parcours.findFirst({
        where: { nom: pNom, mentionId: mention.id },
      });
      if (existingParcours) {
        console.log(`  Parcours deja present: ${pNom}`);
        continue;
      }
      await prisma.parcours.create({
        data: {
          nom: pNom,
          slug: await uniqueSlug('parcours', pNom),
          mentionId: mention.id,
        },
      });
      console.log(`  Parcours OK: ${pNom}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
