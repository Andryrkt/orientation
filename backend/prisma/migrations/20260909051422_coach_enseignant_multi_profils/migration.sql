-- DropIndex
DROP INDEX "coachs_utilisateurId_key";

-- DropIndex
DROP INDEX "enseignants_utilisateurId_key";

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "estCoach" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estEnseignant" BOOLEAN NOT NULL DEFAULT false;
