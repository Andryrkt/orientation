-- CreateEnum
CREATE TYPE "BlogStatut" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REJETE');

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "statut" "BlogStatut" NOT NULL DEFAULT 'APPROUVE';
