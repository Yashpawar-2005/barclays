-- CreateTable
CREATE TABLE "file" (
    "id" SERIAL NOT NULL,
    "s3Link" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);
