-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_verifications_telephone_key" ON "otp_verifications"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_googleId_key" ON "utilisateurs"("googleId");
