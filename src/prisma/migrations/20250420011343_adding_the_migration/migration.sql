-- AlterTable
ALTER TABLE "Discrepancy" ADD COLUMN     "field" TEXT,
ADD COLUMN     "score" TEXT,
ADD COLUMN     "suggestion" TEXT,
ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;
