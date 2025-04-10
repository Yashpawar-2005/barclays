/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('structured', 'validated', 'rejected', 'accepted');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Organisation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "senderemail" TEXT,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOrganisation" (
    "userId" INTEGER NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "UserOrganisation_pkey" PRIMARY KEY ("userId","organisationId")
);

-- CreateTable
CREATE TABLE "Termsheet" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "organisationId" INTEGER NOT NULL,
    "s3Link" TEXT NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "Termsheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discrepancy" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "termsheetId" INTEGER NOT NULL,

    CONSTRAINT "Discrepancy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserOrganisation" ADD CONSTRAINT "UserOrganisation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganisation" ADD CONSTRAINT "UserOrganisation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Termsheet" ADD CONSTRAINT "Termsheet_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discrepancy" ADD CONSTRAINT "Discrepancy_termsheetId_fkey" FOREIGN KEY ("termsheetId") REFERENCES "Termsheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
