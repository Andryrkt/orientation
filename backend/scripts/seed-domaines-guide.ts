// Script ponctuel : ajoute les domaines d'étude manquants pour couvrir les 33 métiers
// du "Guide des Fiches Métiers à Madagascar". N'écrit que ces domaines (upsert par slug).
// Usage : npx ts-node scripts/seed-domaines-guide.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const domainesData = [
  // Domaines "de base" du guide, dédiés et distincts de ceux déjà présents en prod
  // (ex: "SCIENCES et TECHNOLOGIES" / slug sciences-et-technologies), sur choix explicite :
  // ne pas réutiliser les domaines existants pour ces 33 métiers, en créer de nouveaux.
  { nom: 'Sciences et Technologies (Guide Métiers)', slug: 'sciences-technologies', description: 'Mathématiques, physique, informatique, ingénierie.', icone: 'flask', ordre: 1, riasecCodes: ['R', 'I'] },
  { nom: 'Santé (Guide Métiers)', slug: 'sante', description: 'Médecine, paramédical, action humanitaire.', icone: 'heart-pulse', ordre: 2, riasecCodes: ['I', 'S'] },
  { nom: 'Droit et Sciences Politiques (Guide Métiers)', slug: 'droit-sciences-politiques', description: 'Droit, justice, administration publique.', icone: 'scale', ordre: 3, riasecCodes: ['E', 'S'] },
  { nom: 'Économie et Gestion (Guide Métiers)', slug: 'economie-gestion', description: 'Commerce, gestion, finance, comptabilité, ressources humaines.', icone: 'chart-line', ordre: 4, riasecCodes: ['C', 'E'] },
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
