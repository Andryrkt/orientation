-- AlterEnum
ALTER TYPE "FavorisableType" ADD VALUE 'EMPLOI';

-- CreateTable
CREATE TABLE "emplois" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "description" TEXT,
    "domaineId" TEXT,
    "secteurId" TEXT,
    "typeContrat" TEXT,
    "region" TEXT,
    "niveauEtude" TEXT,
    "salaire" TEXT,
    "dateLimiteCandidature" TIMESTAMP(3),
    "lien" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emplois_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "emplois" ADD CONSTRAINT "emplois_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "domaines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emplois" ADD CONSTRAINT "emplois_secteurId_fkey" FOREIGN KEY ("secteurId") REFERENCES "secteurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
