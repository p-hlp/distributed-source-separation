/*
  Warnings:

  - You are about to drop the `Slice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Slice" DROP CONSTRAINT "Slice_audioFileId_fkey";

-- DropTable
DROP TABLE "Slice";
