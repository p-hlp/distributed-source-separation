-- DropForeignKey
ALTER TABLE "AudioFile" DROP CONSTRAINT "AudioFile_parentId_fkey";

-- DropForeignKey
ALTER TABLE "AudioFile" DROP CONSTRAINT "AudioFile_userId_fkey";

-- DropForeignKey
ALTER TABLE "MidiFile" DROP CONSTRAINT "MidiFile_audioFileId_fkey";

-- DropForeignKey
ALTER TABLE "MidiFile" DROP CONSTRAINT "MidiFile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Slice" DROP CONSTRAINT "Slice_audioFileId_fkey";

-- DropForeignKey
ALTER TABLE "Transcription" DROP CONSTRAINT "Transcription_audioFileId_fkey";

-- DropForeignKey
ALTER TABLE "Transcription" DROP CONSTRAINT "Transcription_userId_fkey";

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AudioFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFile" ADD CONSTRAINT "AudioFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidiFile" ADD CONSTRAINT "MidiFile_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "AudioFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidiFile" ADD CONSTRAINT "MidiFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "AudioFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slice" ADD CONSTRAINT "Slice_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "AudioFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
