-- CreateEnum
CREATE TYPE "Periode" AS ENUM ('MIDI', 'APRES_MIDI');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SECRETAIRE';

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "pointDeVenteId" TEXT;

-- CreateTable
CREATE TABLE "points_de_vente" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_de_vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saisies_journalieres" (
    "id" TEXT NOT NULL,
    "pointDeVenteId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "periode" "Periode" NOT NULL,
    "montantGagne" INTEGER NOT NULL DEFAULT 0,
    "montantDepense" INTEGER NOT NULL DEFAULT 0,
    "saisiParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saisies_journalieres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saisies_journalieres_pointDeVenteId_date_periode_key" ON "saisies_journalieres"("pointDeVenteId", "date", "periode");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_pointDeVenteId_fkey" FOREIGN KEY ("pointDeVenteId") REFERENCES "points_de_vente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saisies_journalieres" ADD CONSTRAINT "saisies_journalieres_pointDeVenteId_fkey" FOREIGN KEY ("pointDeVenteId") REFERENCES "points_de_vente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saisies_journalieres" ADD CONSTRAINT "saisies_journalieres_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
