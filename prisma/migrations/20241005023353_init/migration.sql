/*
  Warnings:

  - The values [CANCELLED] on the enum `TournamentStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[brawlstars_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `brawlstars_id` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TournamentStatus_new" AS ENUM ('PENDING', 'ONGOING', 'COMPLETED');
ALTER TABLE "Tournament" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Tournament" ALTER COLUMN "status" TYPE "TournamentStatus_new" USING ("status"::text::"TournamentStatus_new");
ALTER TYPE "TournamentStatus" RENAME TO "TournamentStatus_old";
ALTER TYPE "TournamentStatus_new" RENAME TO "TournamentStatus";
DROP TYPE "TournamentStatus_old";
ALTER TABLE "Tournament" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "brawlstars_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_brawlstars_id_key" ON "User"("brawlstars_id");
