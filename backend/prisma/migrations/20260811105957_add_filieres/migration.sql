-- AlterTable
ALTER TABLE "mouvements_caisse" DROP COLUMN "filiere",
ADD COLUMN     "filiereId" TEXT;

-- CreateTable
CREATE TABLE "filieres" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filieres_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mouvements_caisse" ADD CONSTRAINT "mouvements_caisse_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "filieres"("id") ON DELETE SET NULL ON UPDATE CASCADE;
