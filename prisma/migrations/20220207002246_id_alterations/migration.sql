/*
  Warnings:

  - The primary key for the `Album` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Artist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Music` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Music` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Music" DROP CONSTRAINT "Music_album_id_fkey";

-- DropForeignKey
ALTER TABLE "Music" DROP CONSTRAINT "Music_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "SessionMusic" DROP CONSTRAINT "SessionMusic_music_id_fkey";

-- DropIndex
DROP INDEX "Music_name_key";

-- AlterTable
ALTER TABLE "Album" DROP CONSTRAINT "Album_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "Album_id_seq";

-- AlterTable
ALTER TABLE "Artist" DROP CONSTRAINT "Artist_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "Artist_id_seq";

-- AlterTable
ALTER TABLE "Music" DROP CONSTRAINT "Music_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "album_id" SET DATA TYPE TEXT,
ALTER COLUMN "artist_id" SET DATA TYPE TEXT;
DROP SEQUENCE "Music_id_seq";

-- AlterTable
ALTER TABLE "SessionMusic" ALTER COLUMN "music_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Album_id_key" ON "Album"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_id_key" ON "Artist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Music_id_key" ON "Music"("id");

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Music" ADD CONSTRAINT "Music_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionMusic" ADD CONSTRAINT "SessionMusic_music_id_fkey" FOREIGN KEY ("music_id") REFERENCES "Music"("id") ON DELETE SET NULL ON UPDATE CASCADE;
