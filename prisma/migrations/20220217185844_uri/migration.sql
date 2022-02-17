/*
  Warnings:

  - You are about to drop the column `music_uri` on the `Music` table. All the data in the column will be lost.
  - Added the required column `uri` to the `Music` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Music" DROP COLUMN "music_uri",
ADD COLUMN     "uri" TEXT NOT NULL;
