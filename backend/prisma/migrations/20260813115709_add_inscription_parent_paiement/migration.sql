-- AlterTable
ALTER TABLE "mouvements_caisse" ADD COLUMN     "inscriptionParentId" TEXT;

-- AddForeignKey
ALTER TABLE "mouvements_caisse" ADD CONSTRAINT "mouvements_caisse_inscriptionParentId_fkey" FOREIGN KEY ("inscriptionParentId") REFERENCES "mouvements_caisse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
