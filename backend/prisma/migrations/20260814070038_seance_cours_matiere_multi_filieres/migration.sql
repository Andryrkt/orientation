/*
  Warnings:

  - You are about to drop the column `filiereId` on the `seances_cours` table. All the data in the column will be lost.
  - Added the required column `matiere` to the `seances_cours` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "seances_cours" DROP CONSTRAINT "seances_cours_filiereId_fkey";

-- AlterTable
ALTER TABLE "seances_cours" DROP COLUMN "filiereId",
ADD COLUMN     "matiere" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_FiliereToSeanceCours" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FiliereToSeanceCours_AB_unique" ON "_FiliereToSeanceCours"("A", "B");

-- CreateIndex
CREATE INDEX "_FiliereToSeanceCours_B_index" ON "_FiliereToSeanceCours"("B");

-- AddForeignKey
ALTER TABLE "_FiliereToSeanceCours" ADD CONSTRAINT "_FiliereToSeanceCours_A_fkey" FOREIGN KEY ("A") REFERENCES "filieres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FiliereToSeanceCours" ADD CONSTRAINT "_FiliereToSeanceCours_B_fkey" FOREIGN KEY ("B") REFERENCES "seances_cours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
