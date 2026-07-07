-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VISITOR', 'STUDENT', 'COACH', 'ADMIN');

-- CreateEnum
CREATE TYPE "NiveauMention" AS ENUM ('BTS', 'LICENCE', 'MASTER', 'DOCTORAT');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "emailVerifiedAt" TIMESTAMP(3),
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profils" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "sexe" TEXT,
    "region" TEXT,
    "niveauEtude" TEXT,
    "photo" TEXT,
    "bio" TEXT,
    "interets" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "profils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domaines" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icone" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domaines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metiers" (
    "id" TEXT NOT NULL,
    "domaineId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "missions" TEXT,
    "competences" JSONB NOT NULL DEFAULT '[]',
    "salaireMin" INTEGER,
    "salaireMax" INTEGER,
    "niveauRequis" TEXT,
    "perspectivesEmploi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universites" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "region" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "statut" TEXT NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentions" (
    "id" TEXT NOT NULL,
    "universiteId" TEXT NOT NULL,
    "domaineId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "niveau" "NiveauMention" NOT NULL DEFAULT 'LICENCE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcours" (
    "id" TEXT NOT NULL,
    "mentionId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "duree" TEXT,
    "conditionsAcces" TEXT,
    "debouches" TEXT,
    "fraisAnnuels" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_telephone_key" ON "utilisateurs"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "profils_utilisateurId_key" ON "profils"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "domaines_slug_key" ON "domaines"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "metiers_slug_key" ON "metiers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "universites_slug_key" ON "universites"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "mentions_slug_key" ON "mentions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "parcours_slug_key" ON "parcours"("slug");

-- AddForeignKey
ALTER TABLE "profils" ADD CONSTRAINT "profils_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metiers" ADD CONSTRAINT "metiers_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "domaines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_universiteId_fkey" FOREIGN KEY ("universiteId") REFERENCES "universites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentions" ADD CONSTRAINT "mentions_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "domaines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcours" ADD CONSTRAINT "parcours_mentionId_fkey" FOREIGN KEY ("mentionId") REFERENCES "mentions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
