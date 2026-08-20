/*
  Warnings:

  - You are about to drop the column `phoneVerifiedAt` on the `utilisateurs` table. All the data in the column will be lost.
  - You are about to drop the `otp_verifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "utilisateurs" DROP COLUMN "phoneVerifiedAt";

-- DropTable
DROP TABLE "otp_verifications";
