-- CreateEnum
CREATE TYPE "FavorisableType" AS ENUM ('METIER', 'UNIVERSITE');

-- CreateTable
CREATE TABLE "favoris" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" "FavorisableType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoris_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favoris_utilisateurId_type_entityId_key" ON "favoris"("utilisateurId", "type", "entityId");

-- AddForeignKey
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
