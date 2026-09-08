-- AlterTable
ALTER TABLE "metiers" ADD COLUMN     "etapesEvolution" TEXT[] DEFAULT ARRAY[]::TEXT[];
