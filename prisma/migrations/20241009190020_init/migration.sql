/*
  Warnings:

  - You are about to drop the `_UserTournaments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserTournaments" DROP CONSTRAINT "_UserTournaments_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTournaments" DROP CONSTRAINT "_UserTournaments_B_fkey";

-- DropTable
DROP TABLE "_UserTournaments";

-- CreateTable
CREATE TABLE "Participation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participation_userId_tournamentId_key" ON "Participation"("userId", "tournamentId");

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
