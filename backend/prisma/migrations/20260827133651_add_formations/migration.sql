-- CreateTable
CREATE TABLE "formations" (
    "id" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "duree" TEXT,
    "niveauRequis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "centres_formation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
