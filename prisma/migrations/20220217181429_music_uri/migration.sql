/*
  Warnings:

  - Added the required column `music_uri` to the `Music` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Music" ADD COLUMN     "music_uri" TEXT NOT NULL;
