-- CreateEnum
CREATE TYPE "TypeInvestissement" AS ENUM ('DON', 'PRET', 'APPORT_CAPITAL');

-- CreateEnum
CREATE TYPE "StatutInvestissement" AS ENUM ('PROMIS', 'RECU');

-- CreateTable
CREATE TABLE "investissements" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "bailleur" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "type" "TypeInvestissement" NOT NULL DEFAULT 'APPORT_CAPITAL',
    "statut" "StatutInvestissement" NOT NULL DEFAULT 'RECU',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investissements_pkey" PRIMARY KEY ("id")
);
