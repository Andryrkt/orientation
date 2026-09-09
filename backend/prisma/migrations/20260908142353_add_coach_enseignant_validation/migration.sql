-- AlterTable
ALTER TABLE "coachs" ADD COLUMN     "statutValidation" "BlogStatut" NOT NULL DEFAULT 'APPROUVE';

-- AlterTable
ALTER TABLE "enseignants" ADD COLUMN     "statutValidation" "BlogStatut" NOT NULL DEFAULT 'APPROUVE';
