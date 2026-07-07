-- Recreate `missions` as a list (was free text)
ALTER TABLE "metiers" DROP COLUMN "missions";
ALTER TABLE "metiers" ADD COLUMN "missions" TEXT[] NOT NULL DEFAULT '{}';

-- Section 1 - Identification
ALTER TABLE "metiers" ADD COLUMN "autresAppellations" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "sousDomaine" TEXT;
ALTER TABLE "metiers" ADD COLUMN "secteursActivite" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "codeRome" TEXT;

-- Section 2 - Environnement de travail
ALTER TABLE "metiers" ADD COLUMN "environnementTravail" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "environnementAutre" TEXT;

-- Section 3 - Competences
ALTER TABLE "metiers" ADD COLUMN "competencesComportementales" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "languesRequises" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "niveauLangues" TEXT;

-- Section 4 - Formation et parcours d'acces
ALTER TABLE "metiers" ADD COLUMN "specialiteDiplome" TEXT;
ALTER TABLE "metiers" ADD COLUMN "formationsMadagascar" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "certifications" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "autoFormation" TEXT;

-- Section 5 - Conditions de travail et remuneration
ALTER TABLE "metiers" ADD COLUMN "salaireSource" TEXT;
ALTER TABLE "metiers" ADD COLUMN "typeContrat" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "volumeHoraire" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "penibilitePhysique" INTEGER;
ALTER TABLE "metiers" ADD COLUMN "penibiliteStress" INTEGER;
ALTER TABLE "metiers" ADD COLUMN "penibiliteRisques" INTEGER;
ALTER TABLE "metiers" ADD COLUMN "avantages" TEXT;

-- Section 6 - Marche de l'emploi a Madagascar
ALTER TABLE "metiers" ADD COLUMN "niveauDemande" TEXT;
ALTER TABLE "metiers" ADD COLUMN "regionsPresence" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "postesEvolution" TEXT;
ALTER TABLE "metiers" ADD COLUMN "mobiliteInternationale" TEXT;
ALTER TABLE "metiers" ADD COLUMN "tendances" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "employeurs" TEXT[] NOT NULL DEFAULT '{}';

-- Section 7 - Profil type et personnalite
ALTER TABLE "metiers" ADD COLUMN "traitsPersonnalite" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "centresInteret" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "valeursProfessionnelles" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "profilIntroExtraverti" TEXT;

-- Section 8 - Temoignage professionnel
ALTER TABLE "metiers" ADD COLUMN "temoignagePrenom" TEXT;
ALTER TABLE "metiers" ADD COLUMN "temoignageAnneesExperience" INTEGER;
ALTER TABLE "metiers" ADD COLUMN "temoignageVille" TEXT;
ALTER TABLE "metiers" ADD COLUMN "temoignageSecteurEmployeur" TEXT;
ALTER TABLE "metiers" ADD COLUMN "temoignageCePlait" TEXT;
ALTER TABLE "metiers" ADD COLUMN "temoignageDifficultes" TEXT;
ALTER TABLE "metiers" ADD COLUMN "temoignageConseil" TEXT;
ALTER TABLE "metiers" ADD COLUMN "temoignageCitation" TEXT;
ALTER TABLE "metiers" ADD COLUMN "temoignageAccordPublication" TEXT;

-- Section 9 - Sources et validation
ALTER TABLE "metiers" ADD COLUMN "sources" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "metiers" ADD COLUMN "fiabilite" TEXT;
ALTER TABLE "metiers" ADD COLUMN "observations" TEXT;
