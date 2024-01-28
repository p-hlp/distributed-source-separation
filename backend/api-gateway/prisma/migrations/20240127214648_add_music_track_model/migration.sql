/*
  Warnings:

  - Added the required column `fileType` to the `AudioFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AudioFile" ADD COLUMN     "fileType" TEXT NOT NULL;
