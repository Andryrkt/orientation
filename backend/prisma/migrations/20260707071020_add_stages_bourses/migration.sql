-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FavorisableType" ADD VALUE 'STAGE';
ALTER TYPE "FavorisableType" ADD VALUE 'BOURSE';

-- CreateTable
CREATE TABLE "stages" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "description" TEXT,
    "domaineId" TEXT,
    "duree" TEXT,
    "dateDebut" TIMESTAMP(3),
    "dateLimiteCandidature" TIMESTAMP(3),
    "region" TEXT,
    "niveauEtude" TEXT,
    "remuneration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bourses" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "organisme" TEXT NOT NULL,
    "pays" TEXT,
    "domaineId" TEXT,
    "niveauEtude" TEXT,
    "montant" TEXT,
    "dateLimite" TIMESTAMP(3),
    "conditions" TEXT,
    "lien" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bourses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "domaines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bourses" ADD CONSTRAINT "bourses_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "domaines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
