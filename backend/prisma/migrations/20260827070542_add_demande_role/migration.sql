-- CreateEnum
CREATE TYPE "DemandeRoleType" AS ENUM ('COACH', 'ENSEIGNANT');

-- CreateEnum
CREATE TYPE "DemandeRoleStatut" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REJETEE');

-- CreateTable
CREATE TABLE "demandes_role" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" "DemandeRoleType" NOT NULL,
    "message" TEXT,
    "statut" "DemandeRoleStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "reponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_role_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "demandes_role" ADD CONSTRAINT "demandes_role_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
