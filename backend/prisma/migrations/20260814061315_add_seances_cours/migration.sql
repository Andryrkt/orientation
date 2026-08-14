-- CreateEnum
CREATE TYPE "JourSemaine" AS ENUM ('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE');

-- CreateTable
CREATE TABLE "seances_cours" (
    "id" TEXT NOT NULL,
    "filiereId" TEXT NOT NULL,
    "enseignantId" TEXT NOT NULL,
    "jour" "JourSemaine" NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "salle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seances_cours_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "seances_cours" ADD CONSTRAINT "seances_cours_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "filieres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seances_cours" ADD CONSTRAINT "seances_cours_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "enseignants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
