-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('SOLO', 'DUO', 'TRIOS');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('PENDING', 'ONGOING', 'CANCELED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "brawlstars_id" TEXT NOT NULL,
    "discord_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" SERIAL NOT NULL,
    "tournament_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "game_type" "GameType" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'PENDING',
    "max_participants" INTEGER NOT NULL,
    "hosted_by" TEXT NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserTournaments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_brawlstars_id_key" ON "User"("brawlstars_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "User"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_UserTournaments_AB_unique" ON "_UserTournaments"("A", "B");

-- CreateIndex
CREATE INDEX "_UserTournaments_B_index" ON "_UserTournaments"("B");

-- AddForeignKey
ALTER TABLE "_UserTournaments" ADD CONSTRAINT "_UserTournaments_A_fkey" FOREIGN KEY ("A") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTournaments" ADD CONSTRAINT "_UserTournaments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
