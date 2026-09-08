-- AlterEnum
ALTER TYPE "DemandeRoleType" ADD VALUE 'GESTIONNAIRE_ETABLISSEMENT';

-- AlterTable
ALTER TABLE "centres_formation" ADD COLUMN     "auteurId" TEXT,
ADD COLUMN     "statutValidation" "BlogStatut" NOT NULL DEFAULT 'APPROUVE';

-- AlterTable
ALTER TABLE "universites" ADD COLUMN     "auteurId" TEXT,
ADD COLUMN     "statutValidation" "BlogStatut" NOT NULL DEFAULT 'APPROUVE';

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "estGestionnaireEtablissement" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "universites" ADD CONSTRAINT "universites_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centres_formation" ADD CONSTRAINT "centres_formation_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
