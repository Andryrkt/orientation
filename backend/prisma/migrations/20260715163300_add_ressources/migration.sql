-- CreateEnum
CREATE TYPE "TypeRessource" AS ENUM ('COURS', 'DOCUMENT');

-- AlterEnum
ALTER TYPE "FavorisableType" ADD VALUE 'ENSEIGNANT';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TEACHER';

-- CreateTable
CREATE TABLE "enseignants" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "photo" TEXT,
    "bio" TEXT,
    "matieres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "etablissement" TEXT,
    "disponibilites" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enseignants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enseignant_avis" (
    "id" TEXT NOT NULL,
    "enseignantId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enseignant_avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ressources" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "contenu" TEXT NOT NULL,
    "type" "TypeRessource" NOT NULL,
    "niveauEtude" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "fichierUrl" TEXT,
    "dureeLecture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ressources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enseignants_utilisateurId_key" ON "enseignants"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "enseignant_avis_enseignantId_utilisateurId_key" ON "enseignant_avis"("enseignantId", "utilisateurId");

-- AddForeignKey
ALTER TABLE "enseignants" ADD CONSTRAINT "enseignants_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enseignant_avis" ADD CONSTRAINT "enseignant_avis_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "enseignants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enseignant_avis" ADD CONSTRAINT "enseignant_avis_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
