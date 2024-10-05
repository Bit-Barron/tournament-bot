import { Discord, Slash, SlashOption } from "discordx";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Discord()
export class CreateTournament {
  @Slash({
    name: "create",
    description: "Create a new tournament",
  })
  async createTournament(
    @SlashOption({
      name: "tournament_name",
      description: "The name of the tournament",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    tournamentName: string,

    @SlashOption({
      name: "start_date",
      description: "The start date of the tournament (YYYY-MM-DD)",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    startDate: string,

    @SlashOption({
      name: "game_type",
      description: "The type of game for the tournament",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    gameType: string,

    interaction: CommandInteraction
  ) {
    try {
      const parsedDate = new Date(startDate);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format. Please use YYYY-MM-DD.");
      }

      const tournament = await prisma.tournament.create({
        data: {
          tournament_name: tournamentName,
          game_type: gameType,
          start_date: parsedDate,
        },
      });

      await interaction.reply(
        `Tournament created successfully!\n` +
          `Name: ${tournament.tournament_name}\n` +
          `Start Date: ${tournament.start_date.toISOString().split("T")[0]}\n` +
          `Game Type: ${tournament.game_type}\n` +
          `Tournament ID: ${tournament.id}`
      );
    } catch (error) {
      console.error("Error creating tournament:", error);
      await interaction.reply(
        "An error occurred while creating the tournament. " +
          (error instanceof Error ? error.message : "Please try again later.")
      );
    }
  }
}
