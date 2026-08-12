-- AlterTable
ALTER TABLE "mouvements_caisse" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "filiere" TEXT,
ADD COLUMN     "montantRestant" INTEGER,
ADD COLUMN     "montantTotal" INTEGER,
ADD COLUMN     "nom" TEXT,
ADD COLUMN     "numeroRecu" TEXT,
ADD COLUMN     "prenom" TEXT;
