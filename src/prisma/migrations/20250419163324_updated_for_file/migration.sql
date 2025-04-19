/*
  Warnings:

  - You are about to drop the column `s3Link` on the `Termsheet` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Termsheet` table. All the data in the column will be lost.
  - You are about to drop the `file` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Termsheet" DROP COLUMN "s3Link",
DROP COLUMN "status",
ADD COLUMN     "mapsheetFileId" INTEGER,
ADD COLUMN     "ourtermsheetFileId" INTEGER,
ADD COLUMN     "structuredsheetFileId" INTEGER,
ADD COLUMN     "validatedsheetFileId" INTEGER;

-- DropTable
DROP TABLE "file";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "s3Link" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Termsheet" ADD CONSTRAINT "Termsheet_mapsheetFileId_fkey" FOREIGN KEY ("mapsheetFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Termsheet" ADD CONSTRAINT "Termsheet_structuredsheetFileId_fkey" FOREIGN KEY ("structuredsheetFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Termsheet" ADD CONSTRAINT "Termsheet_ourtermsheetFileId_fkey" FOREIGN KEY ("ourtermsheetFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Termsheet" ADD CONSTRAINT "Termsheet_validatedsheetFileId_fkey" FOREIGN KEY ("validatedsheetFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
