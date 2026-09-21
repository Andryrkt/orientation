// Script ponctuel : ajoute les domaines d'étude manquants pour couvrir les 33 métiers
// du "Guide des Fiches Métiers à Madagascar". N'écrit que ces domaines (upsert par slug).
// Usage : npx ts-node scripts/seed-domaines-guide.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const domainesData = [
  { nom: 'Arts et Communication', slug: 'arts-communication', description: 'Communication digitale, journalisme, création artistique et artisanat d\'art.', icone: 'palette', ordre: 6, riasecCodes: ['A', 'E'] },
  { nom: 'BTP, Énergie & Industrie', slug: 'btp-energie-industrie', description: 'Bâtiment, travaux publics, énergies renouvelables, architecture et industrie minière.', icone: 'hard-hat', ordre: 7, riasecCodes: ['R', 'I'] },
  { nom: 'Agriculture, Agro-industrie & Environnement', slug: 'agriculture-agroindustrie', description: 'Agriculture, élevage, agroalimentaire et gestion des ressources naturelles.', icone: 'sprout', ordre: 8, riasecCodes: ['R', 'I'] },
  { nom: 'Transport & Logistique', slug: 'transport-logistique', description: 'Transport routier, transit et logistique portuaire/aéroportuaire.', icone: 'truck', ordre: 9, riasecCodes: ['R', 'C'] },
  { nom: 'Tourisme & Hôtellerie', slug: 'tourisme-hotellerie', description: 'Guides touristiques, hôtellerie et gestion d\'établissements touristiques.', icone: 'palm-tree', ordre: 10, riasecCodes: ['S', 'E'] },
  { nom: 'Éducation & Enseignement', slug: 'education-enseignement', description: 'Enseignement primaire et secondaire.', icone: 'graduation-cap', ordre: 11, riasecCodes: ['S', 'A'] },
  { nom: 'Sécurité & Défense', slug: 'securite-defense', description: 'Sécurité privée, police et gendarmerie.', icone: 'shield', ordre: 12, riasecCodes: ['R', 'S'] },
];

async function main() {
  for (const d of domainesData) {
    const domaine = await prisma.domaine.upsert({
      where: { slug: d.slug },
      update: { nom: d.nom, description: d.description, icone: d.icone, ordre: d.ordre, riasecCodes: d.riasecCodes },
      create: d,
    });
    console.log(`OK: ${domaine.nom}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
