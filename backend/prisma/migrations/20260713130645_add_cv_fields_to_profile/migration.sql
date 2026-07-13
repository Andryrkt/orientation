-- AlterTable
ALTER TABLE "profils" ADD COLUMN     "competences" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "experiences" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "formations" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "langues" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "titreCv" TEXT;
