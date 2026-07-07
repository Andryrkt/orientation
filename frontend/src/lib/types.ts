export type Role = 'VISITOR' | 'STUDENT' | 'COACH' | 'ADMIN';

export interface Profil {
  id: string;
  dateNaissance: string | null;
  sexe: string | null;
  region: string | null;
  niveauEtude: string | null;
  photo: string | null;
  bio: string | null;
  interets: string[];
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
}

export interface Metier {
  id: string;
  domaineId: string;
  domaine?: Domaine;
  nom: string;
  slug: string;
  description: string | null;
  missions: string | null;
  competences: string[];
  salaireMin: number | null;
  salaireMax: number | null;
  niveauRequis: string | null;
  perspectivesEmploi: string | null;
  similaires?: Metier[];
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
}

export type FavorisableType = 'METIER' | 'UNIVERSITE' | 'STAGE' | 'BOURSE';

export interface Favori {
  id: string;
  utilisateurId: string;
  type: FavorisableType;
  entityId: string;
  createdAt: string;
  entity: { id: string; nom: string; slug: string } | null;
}
