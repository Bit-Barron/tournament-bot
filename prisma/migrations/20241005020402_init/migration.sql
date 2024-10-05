-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "brawlstars_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "tournament_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "game_type" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);
