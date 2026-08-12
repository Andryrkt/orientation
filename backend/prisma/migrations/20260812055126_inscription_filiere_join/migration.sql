-- CreateTable
CREATE TABLE "inscriptions_filieres" (
    "id" TEXT NOT NULL,
    "mouvementId" TEXT NOT NULL,
    "filiereId" TEXT NOT NULL,
    "dateDebutCours" DATE,

    CONSTRAINT "inscriptions_filieres_pkey" PRIMARY KEY ("id")
);

-- Backfill: reprend les paires (filière, mouvement) existantes, en reportant l'ancienne date de
-- début de cours (jusqu'ici unique par mouvement) sur chacune de ses filières.
INSERT INTO "inscriptions_filieres" ("id", "mouvementId", "filiereId", "dateDebutCours")
SELECT gen_random_uuid(), j."B", j."A", mc."dateDebutCours"
FROM "_FiliereToMouvementCaisse" j
JOIN "mouvements_caisse" mc ON mc."id" = j."B";

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_filieres_mouvementId_filiereId_key" ON "inscriptions_filieres"("mouvementId", "filiereId");

-- AddForeignKey
ALTER TABLE "inscriptions_filieres" ADD CONSTRAINT "inscriptions_filieres_mouvementId_fkey" FOREIGN KEY ("mouvementId") REFERENCES "mouvements_caisse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions_filieres" ADD CONSTRAINT "inscriptions_filieres_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "filieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "_FiliereToMouvementCaisse" DROP CONSTRAINT "_FiliereToMouvementCaisse_A_fkey";

-- DropForeignKey
ALTER TABLE "_FiliereToMouvementCaisse" DROP CONSTRAINT "_FiliereToMouvementCaisse_B_fkey";

-- DropTable
DROP TABLE "_FiliereToMouvementCaisse";

-- AlterTable
ALTER TABLE "mouvements_caisse" DROP COLUMN "dateDebutCours";
