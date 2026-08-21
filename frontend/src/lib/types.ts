export type Role = 'VISITOR' | 'STUDENT' | 'COACH' | 'TEACHER' | 'ADMIN' | 'SECRETAIRE' | 'MODERATEUR' | 'MODERATEUR_FINANCE';

export interface PointDeVente {
  id: string;
  nom: string;
  adresse: string | null;
  ville: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  secretaires?: { id: string; nom: string; prenom: string; email: string; telephone: string | null }[];
}

export interface SaisiePeriodeStatut {
  soumis: boolean;
  montantGagne?: number;
  montantDepense?: number;
  fondDeCaisse?: number;
  montantCompte?: number | null;
}

export interface SaisieAujourdhui {
  pointDeVenteId: string;
  date: string;
  midi: SaisiePeriodeStatut;
  apresMidi: SaisiePeriodeStatut;
}

export type Periode = 'MIDI' | 'APRES_MIDI';

export interface SaisieJournaliere {
  id: string;
  pointDeVenteId: string;
  pointDeVente?: { id: string; nom: string; ville: string | null };
  date: string;
  periode: Periode;
  montantGagne: number;
  montantDepense: number;
  fondDeCaisse: number;
  montantCompte: number | null;
  saisiParId: string | null;
  saisiPar?: { id: string; nom: string; prenom: string } | null;
  createdAt: string;
  updatedAt: string;
  mouvementsGagne?: number | null;
  mouvementsDepense?: number | null;
}

export type TypeMouvement = 'GAGNE' | 'DEPENSE';

export interface Filiere {
  id: string;
  nom: string;
  prix: number;
  dateConcours: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FiliereMontant {
  id: string;
  filiereId: string;
  montant: number;
  actif: boolean;
  createdAt: string;
}

// Une date de début de cours se rattache à la paire (mouvement, filière), pas au mouvement seul :
// un même étudiant inscrit dans plusieurs filières peut démarrer chacune à une date différente.
export interface InscriptionFiliere {
  id: string;
  mouvementId: string;
  filiereId: string;
  filiere: Filiere;
  dateDebutCours: string | null;
  dateFinCours: string | null;
}

export interface MouvementCaisse {
  id: string;
  pointDeVenteId: string;
  pointDeVente?: { id: string; nom: string; ville: string | null };
  date: string;
  periode: Periode;
  type: TypeMouvement;
  montant: number;
  note: string | null;
  saisiParId: string | null;
  saisiPar?: { id: string; nom: string; prenom: string } | null;
  createdAt: string;
  nom: string | null;
  prenom: string | null;
  contact: string | null;
  numeroRecu: string | null;
  filieresInscrites: InscriptionFiliere[];
  montantRestant: number | null;
  montantTotal: number | null;
  droitInscription: number | null;
  reduction: number | null;
  noteReduction: string | null;
  // Un étudiant qui revient payer son reste à payer génère un paiement complémentaire rattaché à
  // l'inscription d'origine plutôt qu'une inscription séparée.
  inscriptionParentId: string | null;
  paiementsComplementaires?: PaiementComplementaire[];
  // Calculés côté serveur à partir du montant propre + des paiements complémentaires : à préférer
  // à montantTotal/montantRestant (figés au moment de la création) pour connaître le solde actuel.
  montantPayeTotal?: number;
  montantRestantActuel?: number | null;
  // Autres inscriptions (même nom/prénom) créées via "Dupliquer" — indépendantes de celle-ci,
  // reliées uniquement pour l'affichage (pas de lien en base comme pour un paiement complémentaire).
  autresInscriptions?: AutreInscription[];
}

export interface AutreInscription {
  id: string;
  date: string;
  numeroRecu: string | null;
  filieres: string[];
}

export interface PaiementComplementaire {
  id: string;
  date: string;
  montant: number;
  numeroRecu: string | null;
  // Non vide quand ce paiement correspondait aussi à l'ajout d'une nouvelle filière.
  filieresInscrites?: InscriptionFiliere[];
  saisiPar?: { id: string; nom: string; prenom: string } | null;
}

export interface InscriptionFiliereSuivi extends InscriptionFiliere {
  mouvement: MouvementCaisse;
}

export interface DroitInscription {
  id: string;
  montant: number;
  updatedAt: string;
}

export interface MouvementsPeriode {
  items: MouvementCaisse[];
  totalGagne: number;
  totalDepense: number;
}

export interface MouvementsAujourdhui {
  midi: MouvementsPeriode;
  apresMidi: MouvementsPeriode;
}

export type JourSemaine = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI' | 'DIMANCHE';

export interface Salle {
  id: string;
  nom: string;
  capacite: number;
}

export interface SeanceCours {
  id: string;
  matiere: string;
  filieres: { id: string; nom: string }[];
  enseignantId: string;
  enseignant: { id: string; nom: string; prenom: string };
  jour: JourSemaine;
  heureDebut: string;
  heureFin: string;
  salleId: string;
  salle: Salle;
}

export interface BudgetLigne {
  id: string | null;
  categorie: string;
  annee: number;
  mois: number;
  montantBudget: number | null;
  montantDepense: number;
  ecart: number | null;
  detailsCount: number;
}

export interface BudgetDetailLigne {
  id: string;
  categorie: string;
  annee: number;
  mois: number;
  description: string;
  tauxUnitaire: number;
  quantite: number;
  unite: string | null;
  nombrePeriodes: number;
  ajustementMontant: number | null;
  ajustementNote: string | null;
  montant: number;
}

export interface ResumeBudgets {
  items: BudgetLigne[];
  totalBudget: number;
  totalDepense: number;
  ecartTotal: number;
}

export interface ResumeEtudiantsFiliere {
  filiereId: string;
  filiereNom: string;
  total: number;
}

export interface ResumeEtudiants {
  total: number;
  payeCount: number;
  resteAPayerCount: number;
  renouvellementsCount: number;
}

export interface ResumeSaisiePointDeVente {
  pointDeVente: { id: string; nom: string; ville: string | null };
  totalGagne: number;
  totalDepense: number;
  manquantAujourdhui: Periode[];
}

export interface ResumeSemaine {
  semaineDebut: string;
  semaineFin: string;
  totalGagne: number;
  totalDepense: number;
}

export interface DepenseGlobale {
  id: string;
  date: string;
  categorie: string;
  montant: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TypeInvestissement = 'DON' | 'PRET' | 'APPORT_CAPITAL';
export type StatutInvestissement = 'PROMIS' | 'RECU';

export interface Investissement {
  id: string;
  date: string;
  bailleur: string;
  montant: number;
  type: TypeInvestissement;
  statut: StatutInvestissement;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  adresse: string | null;
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
  username: string | null;
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
  imageBanniere: string | null;
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

export type FavorisableType = 'METIER' | 'UNIVERSITE' | 'STAGE' | 'BOURSE' | 'COACH' | 'CENTRE_FORMATION' | 'ENSEIGNANT';

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

export interface Ressource {
  id: string;
  titre: string;
  description: string | null;
  contenu: string;
  type: 'COURS' | 'DOCUMENT';
  niveauEtude: string;
  categorie: string;
  fichierUrl: string | null;
  dureeLecture: string | null;
  createdAt: string;
}

export interface EnseignantAvis {
  id: string;
  enseignantId: string;
  utilisateurId: string;
  utilisateur?: { id: string; nom: string; prenom: string };
  note: number;
  commentaire: string | null;
  createdAt: string;
}

export interface Enseignant {
  id: string;
  utilisateurId: string | null;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  photo: string | null;
  bio: string | null;
  matieres: string[];
  niveauxEtude: string[];
  etablissement: string | null;
  disponibilites: string | null;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  noteMoyenne: number | null;
  avisCount: number;
  avis?: EnseignantAvis[];
}

export type RendezVousCible = 'COACH' | 'ENSEIGNANT';
export type RendezVousStatut = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE';

export interface RendezVous {
  id: string;
  utilisateurId: string;
  utilisateur?: { id: string; nom: string; prenom: string; email: string; telephone: string | null };
  cible: RendezVousCible;
  coachId: string | null;
  coach?: { id: string; nom: string; prenom: string; photo: string | null } | null;
  enseignantId: string | null;
  enseignant?: { id: string; nom: string; prenom: string; photo: string | null } | null;
  dateSouhaitee: string;
  message: string | null;
  statut: RendezVousStatut;
  reponse: string | null;
  createdAt: string;
  updatedAt: string;
}
