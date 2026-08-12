-- AlterTable
ALTER TABLE "filieres" ADD COLUMN     "dateConcours" DATE;

-- CreateTable
CREATE TABLE "faq_items" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "icone" TEXT NOT NULL DEFAULT '❓',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "publie" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filiere_montants" (
    "id" TEXT NOT NULL,
    "filiereId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "filiere_montants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "filiere_montants" ADD CONSTRAINT "filiere_montants_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "filieres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
