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
    {
      nom: 'Developpeur logiciel', slug: 'developpeur-logiciel', domaine: 'sciences-technologies',
      autresAppellations: ['Ingenieur logiciel', 'Programmeur', 'Developpeur full-stack'],
      sousDomaine: 'Developpement web et mobile',
      secteursActivite: ['Prive', 'Freelance / Independant', 'Entrepreneuriat', 'International'],
      codeRome: 'M1805',
      description: 'Concoit et developpe des applications informatiques repondant aux besoins d\'un client ou d\'une entreprise. Travaille souvent en equipe agile, au bureau ou en teletravail.',
      missions: ['Analyser les besoins fonctionnels du client', 'Concevoir l\'architecture technique de l\'application', 'Developper et tester le code', 'Corriger les bugs et maintenir les applications existantes', 'Documenter le code et les choix techniques'],
      environnementTravail: ['Bureau', 'Domicile / Teletravail'],
      competences: ['JavaScript/TypeScript', 'Bases de donnees SQL', 'Git', 'Frameworks web (React, NestJS...)'],
      competencesComportementales: ['Travail en equipe', 'Autonomie', 'Esprit d\'analyse', 'Adaptabilite'],
      languesRequises: ['Francais', 'Anglais'],
      niveauLangues: 'Anglais technique courant (lecture de documentation)',
      salaireMin: 800000, salaireMax: 3000000,
      salaireSource: 'Entretiens avec des developpeurs a Antananarivo, offres d\'emploi en ligne',
      niveauRequis: 'Licence/Master',
      specialiteDiplome: 'Informatique, genie logiciel',
      formationsMadagascar: ['Licence Informatique - Universite d\'Antananarivo', 'Formations courtes en developpement web (bootcamps prives)'],
      certifications: ['Certifications cloud (AWS, Azure)', 'Certifications frameworks specifiques'],
      autoFormation: 'Oui, partiellement — de nombreux developpeurs autodidactes reussissent, un diplome facilite toutefois l\'acces aux grandes entreprises.',
      typeContrat: ['CDI', 'Freelance', 'Projet / Mission'],
      avantages: 'Teletravail partiel frequent, materiel informatique fourni',
      perspectivesEmploi: 'Tres forte demande, secteur en croissance porte par le developpement du numerique et des zones franches.',
      niveauDemande: 'Tres forte demande (penurie de professionnels)',
      regionsPresence: ['Antananarivo', 'Zones franches'],
      postesEvolution: 'Developpeur junior -> developpeur senior -> lead technique -> architecte logiciel / CTO',
      mobiliteInternationale: 'Fort potentiel de travail a distance pour des entreprises etrangeres (France, Ile Maurice, international).',
      tendances: ['En forte croissance', 'En transformation (numerique, IA, etc.)'],
      employeurs: ['Teknet Madagascar', 'SOFTWELL', 'Startups locales', 'Entreprises de service numerique (ESN)'],
      traitsPersonnalite: ['Rigoureux / Methodique', 'Analytique / Logique', 'Curieux / Chercheur'],
      centresInteret: ['Technologie', 'Resolution de problemes', 'Innovation'],
      valeursProfessionnelles: ['Innovation', 'Liberte / Autonomie', 'Excellence / Expertise'],
      profilIntroExtraverti: 'Adapte aux deux profils : le travail de developpement se fait souvent seul et concentre, mais les phases de conception impliquent des echanges frequents en equipe.',
      temoignagePrenom: 'Tiana', temoignageAnneesExperience: 6, temoignageVille: 'Antananarivo', temoignageSecteurEmployeur: 'Prive',
      temoignageCePlait: 'Voir une idee abstraite se transformer en produit utilise par de vraies personnes, et apprendre en permanence de nouvelles technologies.',
      temoignageDifficultes: 'Les delais serres et la necessite de se tenir constamment a jour face a l\'evolution rapide des outils.',
      temoignageConseil: 'Commence par des petits projets personnels, ne cherche pas la perfection, et rejoins une communaute de developpeurs pour progresser plus vite.',
      temoignageCitation: 'Le code, c\'est comme apprendre une langue : on progresse en le pratiquant tous les jours, pas en lisant des livres.',
      temoignageAccordPublication: 'OUI_PRENOM',
      sources: ['Entretien professionnel — juin 2026', 'Offres d\'emploi LinkedIn/JobLink Madagascar'],
      fiabilite: 'Fiable (professionnels du secteur)',
      riasecCodes: ['R', 'I'],
    },
    {
      nom: 'Medecin generaliste', slug: 'medecin-generaliste', domaine: 'sante',
      autresAppellations: ['Docteur en medecine generale'],
      sousDomaine: 'Medecine generale',
      secteursActivite: ['Public / Etat', 'Prive', 'ONG / Associations'],
      codeRome: 'J1102',
      description: 'Diagnostique et soigne les patients, assure le suivi medical et oriente vers des specialistes si necessaire. Exerce en cabinet, en clinique ou en hopital.',
      missions: ['Ausculter et diagnostiquer les patients', 'Prescrire des traitements et examens', 'Assurer le suivi medical des patients chroniques', 'Orienter vers des specialistes si besoin', 'Participer a des campagnes de prevention'],
      environnementTravail: ['Hopital / Clinique', 'Bureau', 'Terrain / Exterieur'],
      competences: ['Diagnostic clinique', 'Pharmacologie', 'Gestes d\'urgence'],
      competencesComportementales: ['Empathie', 'Sens du service', 'Gestion du stress'],
      languesRequises: ['Malgache', 'Francais'],
      salaireMin: 1000000, salaireMax: 4000000,
      salaireSource: 'Entretien avec des medecins en exercice, grille salariale du secteur public',
      niveauRequis: 'Doctorat en medecine',
      specialiteDiplome: 'Medecine',
      formationsMadagascar: ['Doctorat en Medecine - Universite d\'Antananarivo (Faculte de Medecine)'],
      autoFormation: 'Non — la pratique medicale requiert un diplome et une autorisation d\'exercer.',
      typeContrat: ['Fonction publique', 'CDI', 'Freelance'],
      perspectivesEmploi: 'Forte demande dans tout le pays, notamment en zones rurales ou l\'offre de soins reste insuffisante.',
      niveauDemande: 'Tres forte demande (penurie de professionnels)',
      regionsPresence: ['Tout Madagascar, particulierement les zones rurales'],
      postesEvolution: 'Medecin generaliste -> specialisation (Master/DES) -> chef de service',
      tendances: ['Stable', 'En transformation (numerique, IA, etc.)'],
      employeurs: ['CHU', 'Cliniques privees', 'Centres de sante de base (CSB)', 'ONG medicales'],
      traitsPersonnalite: ['Empathique / Altruiste', 'Rigoureux / Methodique', 'Analytique / Logique'],
      valeursProfessionnelles: ['Utilite sociale / Impact', 'Excellence / Expertise'],
      riasecCodes: ['I', 'S'],
    },
    {
      nom: 'Avocat', slug: 'avocat', domaine: 'droit-sciences-politiques',
      sousDomaine: 'Droit prive et affaires',
      secteursActivite: ['Prive', 'Freelance / Independant'],
      codeRome: 'K1903',
      description: 'Conseille et defend ses clients devant les tribunaux, redige des actes juridiques et intervient en conseil pour des particuliers ou des entreprises.',
      missions: ['Etudier les dossiers et le droit applicable', 'Conseiller les clients sur leurs droits et obligations', 'Plaider devant les tribunaux', 'Rediger des actes et contrats juridiques', 'Assurer une veille juridique reguliere'],
      environnementTravail: ['Bureau', 'En deplacement'],
      competences: ['Droit civil et des affaires', 'Redaction juridique', 'Procedure judiciaire'],
      competencesComportementales: ['Communication orale et ecrite', 'Esprit d\'analyse', 'Leadership'],
      languesRequises: ['Francais', 'Malgache'],
      salaireMin: 700000, salaireMax: 5000000,
      niveauRequis: 'Master en droit + CAPA',
      specialiteDiplome: 'Droit',
      formationsMadagascar: ['Master en Droit - Universite d\'Antananarivo', 'Certificat d\'aptitude a la profession d\'avocat (CAPA)'],
      typeContrat: ['Freelance', 'CDI'],
      perspectivesEmploi: 'Stable, opportunites en cabinet ou en entreprise pour le contentieux et le conseil.',
      niveauDemande: 'Demande equilibree',
      regionsPresence: ['Antananarivo', 'Grandes villes de province'],
      employeurs: ['Cabinet Randria & Associes', 'Cabinets d\'affaires', 'Directions juridiques d\'entreprises'],
      traitsPersonnalite: ['Analytique / Logique', 'Leader / Decideur', 'Social / Communicant'],
      valeursProfessionnelles: ['Excellence / Expertise', 'Rémunération / Statut'],
      riasecCodes: ['E', 'S'],
    },
    {
      nom: 'Traducteur-interprete', slug: 'traducteur-interprete', domaine: 'lettres-sciences-humaines',
      sousDomaine: 'Traduction et interpretation',
      secteursActivite: ['Freelance / Independant', 'ONG / Associations', 'International'],
      description: 'Traduit des documents ecrits ou interprete des echanges oraux entre plusieurs langues, notamment pour le tourisme, les ONG et les organismes internationaux.',
      missions: ['Traduire des documents ecrits en respectant le sens et le style', 'Interpreter en simultane ou en consecutif lors de reunions', 'Verifier la coherence terminologique des traductions', 'Se documenter sur le vocabulaire specifique a chaque mission'],
      environnementTravail: ['Bureau', 'Domicile / Teletravail', 'En deplacement'],
      competences: ['Maitrise de plusieurs langues', 'Techniques d\'interpretation', 'Outils de TAO'],
      languesRequises: ['Francais', 'Anglais', 'Malgache'],
      niveauLangues: 'Bilingue voire trilingue, niveau C1 minimum dans les langues de travail',
      salaireMin: 500000, salaireMax: 2000000,
      niveauRequis: 'Licence/Master en langues',
      specialiteDiplome: 'Langues etrangeres appliquees, traduction',
      typeContrat: ['Freelance', 'Projet / Mission'],
      perspectivesEmploi: 'Bonne demande dans le tourisme, les ONG et les organismes internationaux.',
      niveauDemande: 'Demande equilibree',
      regionsPresence: ['Antananarivo', 'Toamasina', 'zones touristiques'],
      employeurs: ['Agences de voyage', 'ONG internationales', 'Organismes des Nations Unies'],
      traitsPersonnalite: ['Curieux / Chercheur', 'Social / Communicant'],
      valeursProfessionnelles: ['Liberte / Autonomie', 'Collaboration'],
      riasecCodes: ['A', 'S'],
    },
    {
      nom: 'Comptable', slug: 'comptable', domaine: 'economie-gestion',
      sousDomaine: 'Comptabilite generale',
      secteursActivite: ['Prive', 'Public / Etat'],
      codeRome: 'M1203',
      description: 'Tient et controle la comptabilite des entreprises, prepare les bilans et assure les declarations fiscales dans le respect des normes en vigueur.',
      missions: ['Saisir les operations comptables courantes', 'Etablir les bilans et comptes de resultat', 'Preparer les declarations fiscales et sociales', 'Suivre la tresorerie de l\'entreprise', 'Conseiller la direction sur la gestion financiere'],
      environnementTravail: ['Bureau'],
      competences: ['Logiciels comptables (Sage, Ciel)', 'Fiscalite malgache', 'Excel avance'],
      competencesComportementales: ['Sens de l\'organisation', 'Rigueur'],
      languesRequises: ['Francais'],
      salaireMin: 600000, salaireMax: 2500000,
      niveauRequis: 'Licence en comptabilite/gestion',
      specialiteDiplome: 'Comptabilite, gestion',
      typeContrat: ['CDI', 'CDD'],
      perspectivesEmploi: 'Demande constante dans toutes les entreprises, quel que soit le secteur.',
      niveauDemande: 'Demande equilibree',
      regionsPresence: ['Toutes les grandes villes'],
      employeurs: ['Fiduciaire Malagasy Conseil', 'PME locales', 'Grandes entreprises'],
      traitsPersonnalite: ['Rigoureux / Methodique', 'Analytique / Logique'],
      valeursProfessionnelles: ['Securite / Stabilite'],
      riasecCodes: ['C', 'E'],
    },
  ];

  for (const m of metiersData) {
    const { domaine, ...data } = m;
    await prisma.metier.upsert({
      where: { slug: m.slug },
      update: data,
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

  const centresFormationData = [
    {
      nom: 'Centre de Formation Professionnelle Analamanga',
      slug: 'centre-formation-professionnelle-analamanga',
      adresse: 'Lot II M 12 Ankorondrano',
      ville: 'Antananarivo',
      region: 'Analamanga',
      contact: '+261340000001',
      siteWeb: 'https://cfp-analamanga.mg',
    },
    {
      nom: 'Institut de Formation Technique de Toamasina',
      slug: 'institut-formation-technique-toamasina',
      adresse: 'Avenue de l\'Independance',
      ville: 'Toamasina',
      region: 'Atsinanana',
      contact: '+261340000002',
      siteWeb: 'https://ift-toamasina.mg',
    },
  ];

  for (const c of centresFormationData) {
    await prisma.centreFormation.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  const stagesData = [
    { titre: 'Stagiaire developpeur web', entreprise: 'Teknet Madagascar', description: 'Participer au developpement d\'applications web au sein d\'une equipe agile.', domaine: 'sciences-technologies', duree: '3 mois', dateDebut: new Date('2026-09-01'), dateLimiteCandidature: new Date('2026-08-15'), region: 'Analamanga', niveauEtude: 'Licence/Master', remuneration: '300000 Ar/mois' },
    { titre: 'Stagiaire assistant medical', entreprise: 'Clinique Saint Francois Xavier', description: 'Assister les medecins dans le suivi des patients et la gestion des dossiers.', domaine: 'sante', duree: '2 mois', dateDebut: new Date('2026-08-01'), dateLimiteCandidature: new Date('2026-07-20'), region: 'Analamanga', niveauEtude: 'Licence', remuneration: 'Non remunere' },
    { titre: 'Stagiaire juridique', entreprise: 'Cabinet Randria & Associes', description: 'Appui a la redaction d\'actes juridiques et au suivi de dossiers contentieux.', domaine: 'droit-sciences-politiques', duree: '4 mois', dateDebut: new Date('2026-10-01'), dateLimiteCandidature: new Date('2026-09-10'), region: 'Analamanga', niveauEtude: 'Master', remuneration: '250000 Ar/mois' },
    { titre: 'Stagiaire community manager', entreprise: 'Agence Vola Digital', description: 'Gestion des reseaux sociaux et creation de contenu pour des clients locaux.', domaine: 'lettres-sciences-humaines', duree: '3 mois', dateDebut: new Date('2026-09-15'), dateLimiteCandidature: new Date('2026-08-30'), region: 'Atsinanana', niveauEtude: 'Licence', remuneration: '200000 Ar/mois' },
    { titre: 'Stagiaire comptabilite', entreprise: 'Fiduciaire Malagasy Conseil', description: 'Participation aux travaux de cloture comptable et aux declarations fiscales.', domaine: 'economie-gestion', duree: '2 mois', dateDebut: new Date('2026-08-10'), dateLimiteCandidature: new Date('2026-07-25'), region: 'Analamanga', niveauEtude: 'Licence', remuneration: '250000 Ar/mois' },
  ];

  for (const s of stagesData) {
    const { domaine, ...data } = s;
    const existing = await prisma.stage.findFirst({ where: { titre: s.titre, entreprise: s.entreprise } });
    if (!existing) {
      await prisma.stage.create({ data: { ...data, domaineId: domaines.get(domaine)! } });
    }
  }

  const boursesData = [
    { nom: 'Bourse d\'excellence Ambassade de France', organisme: 'Ambassade de France a Madagascar', pays: 'France', domaine: 'sciences-technologies', niveauEtude: 'Master', montant: '700 EUR/mois', dateLimite: new Date('2026-12-15'), conditions: 'Etre admis dans une universite francaise, dossier academique solide.', lien: 'https://mg.ambafrance.org/bourses' },
    { nom: 'Bourse Fulbright', organisme: 'Ambassade des Etats-Unis', pays: 'Etats-Unis', domaine: 'sante', niveauEtude: 'Master/Doctorat', montant: 'Prise en charge complete', dateLimite: new Date('2026-11-01'), conditions: 'Excellent niveau academique, TOEFL requis.', lien: 'https://mg.usembassy.gov/fulbright' },
    { nom: 'Bourse regionale COI', organisme: 'Commission de l\'Ocean Indien', pays: 'Region Ocean Indien', domaine: 'droit-sciences-politiques', niveauEtude: 'Licence/Master', montant: '500000 Ar/mois', dateLimite: new Date('2026-09-30'), conditions: 'Etre ressortissant d\'un pays membre de la COI.', lien: 'https://commissionoceanindien.org/bourses' },
    { nom: 'Bourse Erasmus+', organisme: 'Union Europeenne', pays: 'Union Europeenne', domaine: 'lettres-sciences-humaines', niveauEtude: 'Licence/Master', montant: '850 EUR/mois', dateLimite: new Date('2026-10-20'), conditions: 'Etre inscrit dans un etablissement partenaire Erasmus+.', lien: 'https://erasmus-plus.ec.europa.eu' },
    { nom: 'Bourse d\'etudes Banque Mondiale', organisme: 'Banque Mondiale', pays: 'International', domaine: 'economie-gestion', niveauEtude: 'Master', montant: 'Prise en charge complete', dateLimite: new Date('2026-08-31'), conditions: 'Experience professionnelle de 2 ans minimum, projet de retour a Madagascar.', lien: 'https://worldbank.org/scholarships' },
  ];

  for (const b of boursesData) {
    const { domaine, ...data } = b;
    const existing = await prisma.bourse.findFirst({ where: { nom: b.nom, organisme: b.organisme } });
    if (!existing) {
      await prisma.bourse.create({ data: { ...data, domaineId: domaines.get(domaine)! } });
    }
  }

  const admin = await prisma.utilisateur.findUnique({ where: { email: adminEmail } });
  if (admin) {
    const blogsData = [
      { titre: 'Comment choisir sa filiere apres le bac ?', slug: 'comment-choisir-sa-filiere-apres-le-bac', contenu: 'Choisir sa filiere est une etape decisive. Voici quelques conseils pour orienter ta reflexion : identifie tes centres d\'interet, renseigne-toi sur les debouches, et n\'hesite pas a rencontrer des professionnels du secteur qui t\'attire.', categorie: 'Orientation', publishedAt: new Date('2026-06-01') },
      { titre: '5 bourses d\'etudes a ne pas manquer en 2026', slug: '5-bourses-etudes-a-ne-pas-manquer-2026', contenu: 'De nombreuses bourses sont accessibles aux etudiants malgaches. Nous avons selectionne les 5 opportunites les plus interessantes pour poursuivre tes etudes a l\'etranger ou a Madagascar.', categorie: 'Bourses', publishedAt: new Date('2026-06-10') },
      { titre: 'Reussir son stage : les cles du succes', slug: 'reussir-son-stage-les-cles-du-succes', contenu: 'Le stage est souvent la premiere experience professionnelle. Ponctualite, curiosite et esprit d\'initiative sont les qualites les plus appreciees par les entreprises d\'accueil.', categorie: 'Stages', publishedAt: new Date('2026-06-20') },
      { titre: 'Le metier de developpeur logiciel a Madagascar', slug: 'metier-developpeur-logiciel-madagascar', contenu: 'Le secteur du developpement logiciel connait une forte croissance a Madagascar. Zoom sur les competences recherchees et les perspectives d\'evolution.', categorie: 'Metiers', publishedAt: new Date('2026-07-01') },
    ];

    for (const b of blogsData) {
      await prisma.blog.upsert({
        where: { slug: b.slug },
        update: {},
        create: { ...b, auteurId: admin.id },
      });
    }

    const ressourcesData = [
      // LYCEE
      {
        titre: "Cours de Mathématiques : Dérivées et Limites",
        description: "Maîtrisez les concepts essentiels des dérivées et des calculs de limites pour le BACC.",
        contenu: "# Chapitre 1: Limites et Dérivations\n\n## 1. Définition de la Dérivée\nEn mathématiques, la dérivée d'une fonction d'une variable réelle mesure le taux de variation de la valeur de la fonction par rapport à celle de sa variable...\n\n### Formules importantes :\n- `(x^n)' = n * x^(n-1)`\n- `(sin(x))' = cos(x)`\n- `(cos(x))' = -sin(x)`",
        type: 'COURS',
        niveauEtude: 'LYCEE',
        categorie: 'Mathématiques',
        dureeLecture: '20 min',
      },
      {
        titre: "Sujet corrigé BACC 2025 - Mathématiques (Série C)",
        description: "Sujet officiel du baccalauréat 2025 à Madagascar avec corrigé détaillé étape par étape.",
        contenu: "# Annales BACC Madagascar 2025 - Série C\n\n## Exercice 1 (5 points)\nSoit la suite (U_n) définie par U_0 = 2 et U_(n+1) = 3*U_n + 1...\n\n### Corrigé :\n1. Montrons par récurrence que...",
        type: 'DOCUMENT',
        niveauEtude: 'LYCEE',
        categorie: 'Annales BACC',
        fichierUrl: 'https://example.com/bacc-2025-maths-c.pdf',
        dureeLecture: '12 pages',
      },
      {
        titre: "Manuel de Physique-Chimie Terminale",
        description: "Livre complet regroupant les leçons de mécanique, d'électricité et de chimie organique.",
        contenu: "# Manuel de Physique-Chimie\n\n## Partie 1 : Mécanique de Newton\nLes lois de Newton décrivent la relation entre les forces agissant sur un corps et le mouvement de ce corps...\n\n### Les trois lois :\n1. Principe d'inertie...\n2. Relation fondamentale de la dynamique...",
        type: 'DOCUMENT',
        niveauEtude: 'LYCEE',
        categorie: 'Livres scolaires',
        fichierUrl: 'https://example.com/manuel-physique-chimie-terminale.pdf',
        dureeLecture: '150 pages',
      },
      // NOUVEAU_BACHELIER
      {
        titre: "Annales Corrigées - Concours Polytechnique (ESP)",
        description: "Préparation au concours d'entrée à l'École Supérieure Polytechnique d'Antananarivo (Vontovorona).",
        contenu: "# Concours d'Entrée ESP (Polytech Vontovorona)\n\n## Épreuve de Physique - Session 2024\nUne bille de masse m glisse sans frottement sur un plan incliné...\n\n### Correction proposée :\n1. Le bilan des forces...",
        type: 'DOCUMENT',
        niveauEtude: 'NOUVEAU_BACHELIER',
        categorie: 'Sujets de Concours',
        fichierUrl: 'https://example.com/concours-polytech-2024.pdf',
        dureeLecture: '8 pages',
      },
      {
        titre: "Sujet d'Examen d'Entrée - Médecine & Pharmacie (Ankatso)",
        description: "Anciennes épreuves de biologie et de chimie pour le concours de la Faculté de Médecine.",
        contenu: "# Concours Faculté de Médecine Antananarivo\n\n## Section 1: Biologie Moléculaire\nQCM 1: La réplication de l'ADN se fait selon un mode :\n- [x] A. Semi-conservatif\n- [ ] B. Conservatif\n- [ ] C. Dispersif",
        type: 'DOCUMENT',
        niveauEtude: 'NOUVEAU_BACHELIER',
        categorie: 'Sujets de Concours',
        fichierUrl: 'https://example.com/concours-medecine-biologie.pdf',
        dureeLecture: '15 pages',
      },
      {
        titre: "Guide de Transition : Du Lycée à l'Université",
        description: "Conseils pratiques pour réussir son intégration universitaire, s'organiser et choisir sa mention.",
        contenu: "# Réussir sa transition vers l'université\n\nL'université est très différente du lycée. Vous aurez plus de liberté, mais cela demande aussi beaucoup plus d'autonomie...\n\n## 1. La gestion du temps\n- Planifiez vos heures de travail personnel dès le début de la semaine.\n- Assistez à tous les cours magistraux (CM) et travaux dirigés (TD).",
        type: 'COURS',
        niveauEtude: 'NOUVEAU_BACHELIER',
        categorie: 'Guide Orientation',
        dureeLecture: '10 min',
      },
      // UNIVERSITE
      {
        titre: "Modèle de CV Professionnel Épuré (Word/PDF)",
        description: "Un modèle de CV moderne et sobre idéal pour postuler à des stages ou des premiers emplois.",
        contenu: "# Template de CV Moderne\n\n## Structure recommandée :\n- En-tête (Nom, Prénom, Contacts, LinkedIn)\n- Titre professionnel accrocheur\n- Résumé / Profil de carrière\n- Expériences professionnelles (chronologique inverse)\n- Formations et Diplômes\n- Compétences techniques et humaines\n- Langues et centres d'intérêt",
        type: 'DOCUMENT',
        niveauEtude: 'UNIVERSITE',
        categorie: 'Modèles de CV',
        fichierUrl: 'https://example.com/modele-cv-epure.docx',
        dureeLecture: '1 page',
      },
      {
        titre: "Guide Rédaction : Rapport de Stage de Fin d'Études",
        description: "Manuel complet détaillant la structure, la mise en page et les attendus d'un rapport de stage de Licence.",
        contenu: "# Guide méthodologique du Rapport de Stage\n\n## Introduction\nLe rapport de stage valide votre période d'immersion professionnelle...\n\n### Plan type :\n1. Remerciements\n2. Sommaire\n3. Introduction générale\n4. Présentation de l'entreprise d'accueil\n5. Missions confiées et réalisations\n6. Bilan et compétences acquises\n7. Conclusion générale et perspectives\n8. Annexes et bibliographie",
        type: 'DOCUMENT',
        niveauEtude: 'UNIVERSITE',
        categorie: 'Rapports de Stage',
        fichierUrl: 'https://example.com/guide-rapport-stage.pdf',
        dureeLecture: '15 pages',
      },
      {
        titre: "Guide de Rédaction de Mémoire (Master)",
        description: "Conseils académiques pour structurer, rédiger et présenter sa soutenance de mémoire de Master.",
        contenu: "# Guide de rédaction du Mémoire de Master\n\n## 1. Choix du sujet et problématique\nUne bonne problématique doit être précise, originale et répondre à un problème concret...",
        type: 'DOCUMENT',
        niveauEtude: 'UNIVERSITE',
        categorie: 'Mémoires & Thèses',
        fichierUrl: 'https://example.com/guide-memoire-master.pdf',
        dureeLecture: '32 pages',
      },
    ];

    for (const r of ressourcesData) {
      const existing = await prisma.ressource.findFirst({ where: { titre: r.titre } });
      if (!existing) {
        await prisma.ressource.create({
          data: {
            titre: r.titre,
            description: r.description,
            contenu: r.contenu,
            type: r.type as any,
            niveauEtude: r.niveauEtude,
            categorie: r.categorie,
            fichierUrl: r.fichierUrl,
            dureeLecture: r.dureeLecture,
          },
        });
      }
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
