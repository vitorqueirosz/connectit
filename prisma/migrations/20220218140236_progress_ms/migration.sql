/*
  Warnings:

  - Added the required column `progress_ms` to the `SessionMusic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SessionMusic" ADD COLUMN     "progress_ms" INTEGER NOT NULL;
