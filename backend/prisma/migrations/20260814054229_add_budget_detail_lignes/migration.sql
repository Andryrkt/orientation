-- CreateTable
CREATE TABLE "budget_detail_lignes" (
    "id" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "mois" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "tauxUnitaire" INTEGER NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "unite" TEXT,
    "nombrePeriodes" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "ajustementMontant" INTEGER,
    "ajustementNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_detail_lignes_pkey" PRIMARY KEY ("id")
);
