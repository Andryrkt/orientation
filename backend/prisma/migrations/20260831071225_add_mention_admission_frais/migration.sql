-- CreateEnum
CREATE TYPE "ConditionAdmission" AS ENUM ('SELECTION_DOSSIER', 'EXAMEN_ENTREE', 'TEST_ACCES', 'CONCOURS');

-- AlterTable
ALTER TABLE "mentions" ADD COLUMN     "conditionAdmission" "ConditionAdmission",
ADD COLUMN     "droitInscription" INTEGER,
ADD COLUMN     "fraisAnnuel" INTEGER,
ADD COLUMN     "fraisAnnexe" INTEGER;
