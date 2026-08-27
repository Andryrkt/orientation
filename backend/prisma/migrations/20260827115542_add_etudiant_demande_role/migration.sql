-- AlterEnum
ALTER TYPE "DemandeRoleType" ADD VALUE 'ETUDIANT';

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "estEtudiantValide" BOOLEAN NOT NULL DEFAULT false;
