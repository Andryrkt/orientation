-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_username_key" ON "utilisateurs"("username");
