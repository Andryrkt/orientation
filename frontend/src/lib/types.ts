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

export interface AdminStats {
  utilisateurs: number;
  domaines: number;
  metiers: number;
  universites: number;
  mentions: number;
  parcours: number;
}
