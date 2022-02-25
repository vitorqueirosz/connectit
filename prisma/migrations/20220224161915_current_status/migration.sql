-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('listener', 'owner');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "current_status" "STATUS";
