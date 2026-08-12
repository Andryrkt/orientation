-- DropForeignKey
ALTER TABLE "mouvements_caisse" DROP CONSTRAINT "mouvements_caisse_filiereId_fkey";

-- AlterTable
ALTER TABLE "mouvements_caisse" DROP COLUMN "filiereId";

-- CreateTable
CREATE TABLE "_FiliereToMouvementCaisse" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FiliereToMouvementCaisse_AB_unique" ON "_FiliereToMouvementCaisse"("A", "B");

-- CreateIndex
CREATE INDEX "_FiliereToMouvementCaisse_B_index" ON "_FiliereToMouvementCaisse"("B");

-- AddForeignKey
ALTER TABLE "_FiliereToMouvementCaisse" ADD CONSTRAINT "_FiliereToMouvementCaisse_A_fkey" FOREIGN KEY ("A") REFERENCES "filieres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FiliereToMouvementCaisse" ADD CONSTRAINT "_FiliereToMouvementCaisse_B_fkey" FOREIGN KEY ("B") REFERENCES "mouvements_caisse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
