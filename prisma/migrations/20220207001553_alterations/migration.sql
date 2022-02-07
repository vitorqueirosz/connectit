/*
  Warnings:

  - You are about to drop the column `image` on the `Music` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Music` table. All the data in the column will be lost.
  - Added the required column `type` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Music` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Music" DROP COLUMN "image",
DROP COLUMN "time",
ADD COLUMN     "duration" INTEGER NOT NULL;
