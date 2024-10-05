-- CreateTable
CREATE TABLE "Tournament" (
    "tournament_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "game_type" TEXT NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);
