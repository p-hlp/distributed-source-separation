/*
  Warnings:

  - Made the column `duration` on table `AudioFile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AudioFile" ALTER COLUMN "duration" SET NOT NULL;
