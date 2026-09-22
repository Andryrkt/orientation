-- CreateEnum
CREATE TYPE "TypeConcours" AS ENUM ('UNIVERSITAIRE', 'ADMINISTRATIF');

-- AlterEnum
ALTER TYPE "FavorisableType" ADD VALUE 'CONCOURS';

-- CreateTable
CREATE TABLE "concours" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "type" "TypeConcours" NOT NULL,
    "organisateur" TEXT NOT NULL,
    "description" TEXT,
    "domaineId" TEXT,
    "niveauRequis" TEXT,
    "nombrePlaces" INTEGER,
    "region" TEXT,
    "fraisInscription" TEXT,
    "dateConcours" TIMESTAMP(3),
    "dateLimiteInscription" TIMESTAMP(3),
    "conditions" TEXT,
    "lien" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concours_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "concours" ADD CONSTRAINT "concours_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "domaines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
