-- AlterEnum
ALTER TYPE "FavorisableType" ADD VALUE 'COACH';

-- CreateTable
CREATE TABLE "coachs" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "photo" TEXT,
    "bio" TEXT,
    "specialites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience" TEXT,
    "disponibilites" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coachs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_avis" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_avis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coachs_utilisateurId_key" ON "coachs"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "coach_avis_coachId_utilisateurId_key" ON "coach_avis"("coachId", "utilisateurId");

-- AddForeignKey
ALTER TABLE "coachs" ADD CONSTRAINT "coachs_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_avis" ADD CONSTRAINT "coach_avis_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "coachs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_avis" ADD CONSTRAINT "coach_avis_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
