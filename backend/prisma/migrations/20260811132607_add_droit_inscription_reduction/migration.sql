-- AlterTable
ALTER TABLE "mouvements_caisse" ADD COLUMN     "droitInscription" INTEGER,
ADD COLUMN     "noteReduction" TEXT,
ADD COLUMN     "reduction" INTEGER;

-- CreateTable
CREATE TABLE "droit_inscription" (
    "id" TEXT NOT NULL,
    "montant" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "droit_inscription_pkey" PRIMARY KEY ("id")
);
