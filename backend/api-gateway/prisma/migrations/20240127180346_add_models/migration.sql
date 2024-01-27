/*
  Warnings:

  - You are about to drop the `MusicTrack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MusicTrack" DROP CONSTRAINT "MusicTrack_userId_fkey";

-- DropTable
DROP TABLE "MusicTrack";

-- CreateTable
CREATE TABLE "AudioFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MidiFile" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "audioFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MidiFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "audioFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MidiFile_audioFileId_key" ON "MidiFile"("audioFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Transcription_audioFileId_key" ON "Transcription"("audioFileId");

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AudioFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidiFile" ADD CONSTRAINT "MidiFile_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "AudioFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "AudioFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
