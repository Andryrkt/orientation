/*
  Warnings:

  - You are about to drop the column `salle` on the `seances_cours` table. All the data in the column will be lost.
  - Added the required column `salleId` to the `seances_cours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "seances_cours" DROP COLUMN "salle",
ADD COLUMN     "salleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "salles" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salles_nom_key" ON "salles"("nom");

-- AddForeignKey
ALTER TABLE "seances_cours" ADD CONSTRAINT "seances_cours_salleId_fkey" FOREIGN KEY ("salleId") REFERENCES "salles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
