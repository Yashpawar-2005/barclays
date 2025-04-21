-- AlterTable
ALTER TABLE "Termsheet" ADD COLUMN     "coloursheetFileId" INTEGER;

-- AddForeignKey
ALTER TABLE "Termsheet" ADD CONSTRAINT "Termsheet_coloursheetFileId_fkey" FOREIGN KEY ("coloursheetFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
