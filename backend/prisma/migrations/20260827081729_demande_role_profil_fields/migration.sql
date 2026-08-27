-- AlterEnum
ALTER TYPE "DemandeRoleStatut" ADD VALUE 'CLARIFICATION_DEMANDEE';

-- AlterTable
ALTER TABLE "demandes_role" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "disponibilites" TEXT,
ADD COLUMN     "etablissement" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "matieres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "niveauxEtude" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialites" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "telephone" TEXT;
