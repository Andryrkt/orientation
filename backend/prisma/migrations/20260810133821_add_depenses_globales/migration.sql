-- CreateTable
CREATE TABLE "depenses_globales" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "categorie" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "depenses_globales_pkey" PRIMARY KEY ("id")
);
