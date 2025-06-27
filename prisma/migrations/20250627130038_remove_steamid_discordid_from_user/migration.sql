/*
  Warnings:

  - You are about to drop the column `discordId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `steamId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_discordId_key";

-- DropIndex
DROP INDEX "User_steamId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "discordId",
DROP COLUMN "steamId";
