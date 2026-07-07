-- CreateEnum
CREATE TYPE "TypeQuestion" AS ENUM ('CHOIX_MULTIPLE', 'ECHELLE', 'TEXTE');

-- AlterTable
ALTER TABLE "domaines" ADD COLUMN     "riasecCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "metiers" ADD COLUMN     "riasecCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "questionnaires" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT DEFAULT 'RIASEC',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "type" "TypeQuestion" NOT NULL DEFAULT 'CHOIX_MULTIPLE',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "scoreDimensions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reponses" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "score" JSONB NOT NULL DEFAULT '{}',
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "reponses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultats_orientation" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "profilDominant" TEXT,
    "domainesRecommandes" JSONB NOT NULL DEFAULT '[]',
    "metiersRecommandes" JSONB NOT NULL DEFAULT '[]',
    "reponses" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultats_orientation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reponses" ADD CONSTRAINT "reponses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_orientation" ADD CONSTRAINT "resultats_orientation_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_orientation" ADD CONSTRAINT "resultats_orientation_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
