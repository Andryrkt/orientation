// Script ponctuel : insère uniquement les 9 secteurs stratégiques (n'écrit rien d'autre).
// Usage : npx ts-node scripts/seed-secteurs.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const secteursData = [
  { nom: 'Numerique, BPO & Services Externalises', slug: 'numerique-bpo-services-externalises', ordre: 1 },
  { nom: 'Energies Renouvelables, BTP & Industrie Miniere', slug: 'energies-renouvelables-btp-industrie-miniere', ordre: 2 },
  { nom: 'Agro-industrie, Elevage & Gestion des Ressources', slug: 'agro-industrie-elevage-gestion-des-ressources', ordre: 3 },
  { nom: 'Finance de Proximite, Microfinance & Commerce Distributif', slug: 'finance-proximite-microfinance-commerce-distributif', ordre: 4 },
  { nom: 'Sante, Paramedical & Action Humanitaire', slug: 'sante-paramedical-action-humanitaire', ordre: 5 },
  { nom: 'Transport, Transit & Economie Bleue (Maritime)', slug: 'transport-transit-economie-bleue-maritime', ordre: 6 },
  { nom: 'Tourisme & Hotellerie', slug: 'tourisme-hotellerie', ordre: 7 },
  { nom: 'Education & Enseignement', slug: 'education-enseignement', ordre: 8 },
  { nom: 'Autres Secteurs Porteurs', slug: 'autres-secteurs-porteurs', ordre: 9 },
];

async function main() {
  for (const s of secteursData) {
    const secteur = await prisma.secteur.upsert({
      where: { slug: s.slug },
      update: { nom: s.nom, ordre: s.ordre },
      create: s,
    });
    console.log(`OK: ${secteur.nom}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
