export type Role = 'VISITOR' | 'STUDENT' | 'COACH' | 'ADMIN';

export interface ExperienceCv {
  poste: string;
  entreprise: string;
  dateDebut: string;
  dateFin: string;
  description: string;
}

export interface FormationCv {
  diplome: string;
  ecole: string;
  dateDebut: string;
  dateFin: string;
  description: string;
}

export interface LangueCv {
  langue: string;
  niveau: string;
}

export interface Profil {
  id: string;
  dateNaissance: string | null;
  sexe: string | null;
  region: string | null;
  niveauEtude: string | null;
  photo: string | null;
  bio: string | null;
  interets: string[];
  titreCv: string | null;
  experiences: ExperienceCv[];
  formations: FormationCv[];
  competences: string[];
  langues: LangueCv[];
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: Role;
  emailVerifiedAt: string | null;
  profil?: Profil | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Domaine {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  icone: string | null;
  ordre: number;
  riasecCodes?: string[];
}

export interface Metier {
  id: string;
  domaineId: string;
  domaine?: Domaine;
  nom: string;
  slug: string;
  description: string | null;
  missions: string[];
  competences: string[];
  salaireMin: number | null;
  salaireMax: number | null;
  niveauRequis: string | null;
  perspectivesEmploi: string | null;
  similaires?: Metier[];
  riasecCodes?: string[];

  // Section 1 - Identification
  autresAppellations: string[];
  sousDomaine: string | null;
  secteursActivite: string[];
  codeRome: string | null;

  // Section 2 - Environnement de travail
  environnementTravail: string[];
  environnementAutre: string | null;

  // Section 3 - Competences
  competencesComportementales: string[];
  languesRequises: string[];
  niveauLangues: string | null;

  // Section 4 - Formation et parcours d'acces
  specialiteDiplome: string | null;
  formationsMadagascar: string[];
  certifications: string[];
  autoFormation: string | null;

  // Section 5 - Conditions de travail et remuneration
  salaireSource: string | null;
  typeContrat: string[];
  volumeHoraire: string[];
  penibilitePhysique: number | null;
  penibiliteStress: number | null;
  penibiliteRisques: number | null;
  avantages: string | null;

  // Section 6 - Marche de l'emploi a Madagascar
  niveauDemande: string | null;
  regionsPresence: string[];
  postesEvolution: string | null;
  mobiliteInternationale: string | null;
  tendances: string[];
  employeurs: string[];

  // Section 7 - Profil type et personnalite
  traitsPersonnalite: string[];
  centresInteret: string[];
  valeursProfessionnelles: string[];
  profilIntroExtraverti: string | null;

  // Section 8 - Temoignage professionnel
  temoignagePrenom: string | null;
  temoignageAnneesExperience: number | null;
  temoignageVille: string | null;
  temoignageSecteurEmployeur: string | null;
  temoignageCePlait: string | null;
  temoignageDifficultes: string | null;
  temoignageConseil: string | null;
  temoignageCitation: string | null;
  temoignageAccordPublication: string | null;

  // Section 9 - Sources et validation
  sources: string[];
  fiabilite: string | null;
  observations: string | null;
}

export interface Universite {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  adresse: string | null;
  ville: string | null;
  region: string | null;
  telephone: string | null;
  email: string | null;
  siteWeb: string | null;
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  statut: string;
  mentions?: Mention[];
}

export interface Mention {
  id: string;
  universiteId: string;
  universite?: Universite;
  domaineId: string;
  domaine?: Domaine;
  nom: string;
  slug: string;
  description: string | null;
  niveau: 'BTS' | 'LICENCE' | 'MASTER' | 'DOCTORAT';
  parcours?: Parcours[];
}

export interface Parcours {
  id: string;
  mentionId: string;
  mention?: Mention;
  nom: string;
  slug: string;
  description: string | null;
  duree: string | null;
  conditionsAcces: string | null;
  debouches: string | null;
  fraisAnnuels: number | null;
}

export interface Stage {
  id: string;
  titre: string;
  entreprise: string;
  description: string | null;
  domaineId: string | null;
  domaine?: Domaine | null;
  duree: string | null;
  dateDebut: string | null;
  dateLimiteCandidature: string | null;
  region: string | null;
  niveauEtude: string | null;
  remuneration: string | null;
}

export interface Bourse {
  id: string;
  nom: string;
  organisme: string;
  pays: string | null;
  domaineId: string | null;
  domaine?: Domaine | null;
  niveauEtude: string | null;
  montant: string | null;
  dateLimite: string | null;
  conditions: string | null;
  lien: string | null;
}

export interface AuteurResume {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
}

export type CommentaireStatut = 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';

export interface BlogCommentaire {
  id: string;
  blogId: string;
  utilisateurId: string;
  utilisateur?: AuteurResume;
  blog?: { id: string; titre: string; slug: string };
  contenu: string;
  statut: CommentaireStatut;
  createdAt: string;
}

export interface Blog {
  id: string;
  titre: string;
  slug: string;
  contenu: string;
  image: string | null;
  categorie: string | null;
  auteurId: string;
  auteur?: AuteurResume;
  publishedAt: string | null;
  createdAt: string;
  _count?: { likes: number; commentaires?: number };
  commentaires?: BlogCommentaire[];
}

export interface AdminStats {
  utilisateurs: number;
  domaines: number;
  metiers: number;
  universites: number;
  mentions: number;
  parcours: number;
  stages: number;
  bourses: number;
  blogs: number;
  testsCompletes: number;
  coachs: number;
  centresFormation: number;
  tickets: number;
}

export type TypeQuestion = 'CHOIX_MULTIPLE' | 'ECHELLE' | 'TEXTE';

export interface Reponse {
  id: string;
  texte: string;
  ordre: number;
  score?: Record<string, number>;
}

export interface Question {
  id: string;
  texte: string;
  type: TypeQuestion;
  ordre: number;
  scoreDimensions?: Record<string, number>;
  reponses: Reponse[];
}

export interface Questionnaire {
  id: string;
  titre: string;
  description: string | null;
  type: string | null;
  actif?: boolean;
  questions?: Question[];
  _count?: { questions: number; resultats: number };
}

export interface RecommendationItem {
  id: string;
  nom: string;
  slug: string;
}

export interface ResultatOrientation {
  id: string;
  utilisateurId: string;
  questionnaireId: string;
  questionnaire?: { titre: string };
  scores: Record<string, number>;
  profilDominant: string | null;
  domainesRecommandes: RecommendationItem[];
  metiersRecommandes: RecommendationItem[];
  reponses: unknown[];
  createdAt: string;
}

export interface CoachAvis {
  id: string;
  coachId: string;
  utilisateurId: string;
  utilisateur?: AuteurResume;
  note: number;
  commentaire: string | null;
  createdAt: string;
}

export interface Coach {
  id: string;
  utilisateurId: string | null;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  photo: string | null;
  bio: string | null;
  specialites: string[];
  experience: string | null;
  disponibilites: string | null;
  visible: boolean;
  noteMoyenne: number | null;
  avisCount: number;
  avis?: CoachAvis[];
}

export interface CentreFormation {
  id: string;
  nom: string;
  slug: string;
  adresse: string | null;
  ville: string | null;
  region: string | null;
  contact: string | null;
  siteWeb: string | null;
}

export type FavorisableType = 'METIER' | 'UNIVERSITE' | 'STAGE' | 'BOURSE' | 'COACH' | 'CENTRE_FORMATION';

export interface Favori {
  id: string;
  utilisateurId: string;
  type: FavorisableType;
  entityId: string;
  createdAt: string;
  entity: { id: string; nom: string; slug: string } | null;
}

export type TicketStatut = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'FERME';
export type TicketPriorite = 'BASSE' | 'MOYENNE' | 'HAUTE';

export interface TicketMessage {
  id: string;
  ticketId: string;
  auteurId: string;
  auteur?: AuteurResume;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  sujet: string;
  description: string | null;
  statut: TicketStatut;
  priorite: TicketPriorite;
  categorie: string;
  utilisateurId: string;
  utilisateur?: AuteurResume;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}
