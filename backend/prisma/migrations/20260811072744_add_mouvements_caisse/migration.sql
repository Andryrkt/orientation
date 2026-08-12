-- CreateEnum
CREATE TYPE "TypeMouvement" AS ENUM ('GAGNE', 'DEPENSE');

-- CreateTable
CREATE TABLE "mouvements_caisse" (
    "id" TEXT NOT NULL,
    "pointDeVenteId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "periode" "Periode" NOT NULL,
    "type" "TypeMouvement" NOT NULL,
    "montant" INTEGER NOT NULL,
    "note" TEXT,
    "saisiParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_caisse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mouvements_caisse" ADD CONSTRAINT "mouvements_caisse_pointDeVenteId_fkey" FOREIGN KEY ("pointDeVenteId") REFERENCES "points_de_vente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_caisse" ADD CONSTRAINT "mouvements_caisse_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
