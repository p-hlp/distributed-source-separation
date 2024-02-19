/*
  Warnings:

  - Added the required column `color` to the `Slice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Slice" ADD COLUMN     "color" TEXT NOT NULL;
