import { PrismaClient, NiveauMention, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@orientmad.mg';
  const adminPassword = 'Admin123!';

  const existingAdmin = await prisma.utilisateur.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.utilisateur.create({
      data: {
        nom: 'Admin',
        prenom: 'OrientMad',
        email: adminEmail,
        telephone: '+261340000000',
        password: await bcrypt.hash(adminPassword, 10),
        role: Role.ADMIN,
        emailVerifiedAt: new Date(),
        profil: { create: {} },
      },
    });
    console.log(`Compte admin cree : ${adminEmail} / ${adminPassword}`);
  }

  const domainesData = [
    { nom: 'Sciences et Technologies', slug: 'sciences-technologies', description: 'Mathematiques, physique, informatique, ingenierie.', icone: 'flask', ordre: 1, riasecCodes: ['R', 'I'] },
    { nom: 'Sante', slug: 'sante', description: 'Medecine, pharmacie, soins infirmiers.', icone: 'heart-pulse', ordre: 2, riasecCodes: ['I', 'S'] },
    { nom: 'Droit et Sciences Politiques', slug: 'droit-sciences-politiques', description: 'Droit, administration publique, relations internationales.', icone: 'scale', ordre: 3, riasecCodes: ['E', 'S'] },
    { nom: 'Lettres et Sciences Humaines', slug: 'lettres-sciences-humaines', description: 'Langues, histoire, sociologie, psychologie.', icone: 'book', ordre: 4, riasecCodes: ['A', 'S'] },
    { nom: 'Economie et Gestion', slug: 'economie-gestion', description: 'Commerce, gestion, finance, comptabilite.', icone: 'chart-line', ordre: 5, riasecCodes: ['C', 'E'] },
  ];

  const domaines = new Map<string, string>();
  for (const d of domainesData) {
    const domaine = await prisma.domaine.upsert({
      where: { slug: d.slug },
      update: { riasecCodes: d.riasecCodes },
      create: d,
    });
    domaines.set(d.slug, domaine.id);
  }

  const metiersData = [
    { nom: 'Developpeur logiciel', slug: 'developpeur-logiciel', domaine: 'sciences-technologies', description: 'Concoit et developpe des applications informatiques.', missions: 'Analyse des besoins, developpement, tests, maintenance.', salaireMin: 800000, salaireMax: 3000000, niveauRequis: 'Licence/Master', perspectivesEmploi: 'Tres forte demande, secteur en croissance.', riasecCodes: ['R', 'I'] },
    { nom: 'Medecin generaliste', slug: 'medecin-generaliste', domaine: 'sante', description: 'Diagnostique et soigne les patients.', missions: 'Consultation, diagnostic, prescription, suivi.', salaireMin: 1000000, salaireMax: 4000000, niveauRequis: 'Doctorat en medecine', perspectivesEmploi: 'Forte demande dans tout le pays.', riasecCodes: ['I', 'S'] },
    { nom: 'Avocat', slug: 'avocat', domaine: 'droit-sciences-politiques', description: 'Conseille et defend ses clients devant les tribunaux.', missions: 'Conseil juridique, plaidoirie, redaction d\'actes.', salaireMin: 700000, salaireMax: 5000000, niveauRequis: 'Master en droit + CAPA', perspectivesEmploi: 'Stable, opportunites en cabinet ou entreprise.', riasecCodes: ['E', 'S'] },
    { nom: 'Traducteur-interprete', slug: 'traducteur-interprete', domaine: 'lettres-sciences-humaines', description: 'Traduit des documents ou interprete des echanges oraux.', missions: 'Traduction ecrite, interpretation simultanee/consecutive.', salaireMin: 500000, salaireMax: 2000000, niveauRequis: 'Licence/Master en langues', perspectivesEmploi: 'Bonne demande dans le tourisme et les ONG.', riasecCodes: ['A', 'S'] },
    { nom: 'Comptable', slug: 'comptable', domaine: 'economie-gestion', description: 'Tient et controle la comptabilite des entreprises.', missions: 'Saisie comptable, bilans, declarations fiscales.', salaireMin: 600000, salaireMax: 2500000, niveauRequis: 'Licence en comptabilite/gestion', perspectivesEmploi: 'Demande constante dans toutes les entreprises.', riasecCodes: ['C', 'E'] },
  ];

  for (const m of metiersData) {
    const { domaine, ...data } = m;
    await prisma.metier.upsert({
      where: { slug: m.slug },
      update: { riasecCodes: data.riasecCodes },
      create: { ...data, domaineId: domaines.get(domaine)! },
    });
  }

  const universite = await prisma.universite.upsert({
    where: { slug: 'universite-antananarivo' },
    update: {},
    create: {
      nom: "Universite d'Antananarivo",
      slug: 'universite-antananarivo',
      description: 'Premiere universite publique de Madagascar.',
      adresse: 'Ankatso',
      ville: 'Antananarivo',
      region: 'Analamanga',
      telephone: '+261202234567',
      email: 'contact@univ-antananarivo.mg',
      siteWeb: 'https://www.univ-antananarivo.mg',
      latitude: -18.9146,
      longitude: 47.5316,
      statut: 'public',
    },
  });

  const mention = await prisma.mention.upsert({
    where: { slug: 'informatique-antananarivo' },
    update: {},
    create: {
      nom: 'Informatique',
      slug: 'informatique-antananarivo',
      description: 'Mention informatique de la faculte des sciences.',
      niveau: NiveauMention.LICENCE,
      universiteId: universite.id,
      domaineId: domaines.get('sciences-technologies')!,
    },
  });

  await prisma.parcours.upsert({
    where: { slug: 'genie-logiciel-antananarivo' },
    update: {},
    create: {
      nom: 'Genie logiciel',
      slug: 'genie-logiciel-antananarivo',
      description: 'Parcours axe sur le developpement logiciel et les architectures systeme.',
      duree: '3 ans (Licence)',
      conditionsAcces: 'Baccalaureat serie C, D ou technique',
      debouches: 'Developpeur, chef de projet informatique, administrateur systeme.',
      fraisAnnuels: 200000,
      mentionId: mention.id,
    },
  });

  const questionnaire = await prisma.questionnaire.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      titre: "Questionnaire d'orientation RIASEC",
      description:
        "Decouvre les domaines et metiers qui te correspondent selon le modele RIASEC (Holland), l'un des referentiels les plus utilises en psychologie de l'orientation.",
      type: 'RIASEC',
      actif: true,
    },
  });

  const existingQuestions = await prisma.question.count({ where: { questionnaireId: questionnaire.id } });
  if (existingQuestions === 0) {
    const questions: { texte: string; dimension: string }[] = [
      { texte: 'J\'aime réparer ou construire des objets avec mes mains.', dimension: 'R' },
      { texte: 'Je préfère les activités physiques et concrètes aux tâches abstraites.', dimension: 'R' },
      { texte: 'J\'aime résoudre des problèmes complexes et analyser des données.', dimension: 'I' },
      { texte: 'Je suis curieux(se) de comprendre comment les choses fonctionnent scientifiquement.', dimension: 'I' },
      { texte: 'J\'aime m\'exprimer à travers l\'art, la musique ou l\'écriture.', dimension: 'A' },
      { texte: 'Je recherche des activités qui stimulent ma créativité.', dimension: 'A' },
      { texte: 'J\'aime aider, enseigner ou conseiller les autres.', dimension: 'S' },
      { texte: 'Je me sens à l\'aise pour travailler en équipe et écouter les autres.', dimension: 'S' },
      { texte: 'J\'aime prendre des initiatives et convaincre les autres.', dimension: 'E' },
      { texte: 'Je suis motivé(e) par les responsabilités et le leadership.', dimension: 'E' },
      { texte: 'J\'aime organiser, planifier et suivre des procédures précises.', dimension: 'C' },
      { texte: 'Je suis à l\'aise avec les tâches administratives et la gestion de données.', dimension: 'C' },
    ];

    for (const [index, q] of questions.entries()) {
      await prisma.question.create({
        data: {
          questionnaireId: questionnaire.id,
          texte: q.texte,
          type: 'ECHELLE',
          ordre: index + 1,
          scoreDimensions: { [q.dimension]: 1 },
        },
      });
    }
    console.log(`Questionnaire RIASEC seede avec ${questions.length} questions.`);
  }

  const coachsData = [
    {
      nom: 'Rakoto',
      prenom: 'Herimanana',
      email: 'herimanana.coach@orientmad.mg',
      specialites: ['Orientation scolaire', 'CV et lettre de motivation'],
      experience: "10 ans d'accompagnement de jeunes lyceens et etudiants a Madagascar.",
      bio: 'Coach certifie en orientation, ancien conseiller pedagogique.',
    },
    {
      nom: 'Andriamampionona',
      prenom: 'Fanja',
      email: 'fanja.coach@orientmad.mg',
      specialites: ['Entrepreneuriat', 'Bourses d\'etudes'],
      experience: "8 ans d'experience dans l'accompagnement de projets entrepreneuriaux etudiants.",
      bio: "Consultante en developpement de carriere, specialiste des bourses internationales.",
    },
  ];

  for (const c of coachsData) {
    const existing = await prisma.coach.findFirst({ where: { email: c.email } });
    if (!existing) {
      await prisma.coach.create({ data: c });
    }
  }

  console.log('Seed termine.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
