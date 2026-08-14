-- AlterTable
ALTER TABLE "enseignants" ADD COLUMN     "niveauxEtude" TEXT[] DEFAULT ARRAY[]::TEXT[];
