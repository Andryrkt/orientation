-- AlterEnum
ALTER TYPE "FavorisableType" ADD VALUE 'CENTRE_FORMATION';

-- CreateTable
CREATE TABLE "centres_formation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "region" TEXT,
    "contact" TEXT,
    "siteWeb" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "centres_formation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "centres_formation_slug_key" ON "centres_formation"("slug");
