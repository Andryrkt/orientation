-- AlterTable
ALTER TABLE "metiers" ADD COLUMN     "secteurId" TEXT;

-- CreateTable
CREATE TABLE "secteurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secteurs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "secteurs_slug_key" ON "secteurs"("slug");

-- AddForeignKey
ALTER TABLE "metiers" ADD CONSTRAINT "metiers_secteurId_fkey" FOREIGN KEY ("secteurId") REFERENCES "secteurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
