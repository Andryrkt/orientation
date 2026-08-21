-- CreateEnum
CREATE TYPE "RendezVousCible" AS ENUM ('COACH', 'ENSEIGNANT');

-- CreateEnum
CREATE TYPE "RendezVousStatut" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'ANNULE', 'TERMINE');

-- CreateTable
CREATE TABLE "rendez_vous" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "cible" "RendezVousCible" NOT NULL,
    "coachId" TEXT,
    "enseignantId" TEXT,
    "dateSouhaitee" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "statut" "RendezVousStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "reponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rendez_vous_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coachs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "enseignants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
