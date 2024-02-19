-- CreateTable
CREATE TABLE "Slice" (
    "id" TEXT NOT NULL,
    "sliceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start" DOUBLE PRECISION NOT NULL,
    "end" DOUBLE PRECISION,
    "audioFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Slice_sliceId_key" ON "Slice"("sliceId");

-- CreateIndex
CREATE UNIQUE INDEX "Slice_audioFileId_key" ON "Slice"("audioFileId");

-- AddForeignKey
ALTER TABLE "Slice" ADD CONSTRAINT "Slice_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "AudioFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
