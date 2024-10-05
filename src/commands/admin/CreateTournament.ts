import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import prisma from "../../lib/prisma.js";

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

    @SlashChoice({ name: "Today", value: "TODAY" })
    @SlashChoice({ name: "Custom Date", value: "CUSTOM" })
    @SlashOption({
      name: "date_option",
      description: "Choose today's date or enter a custom date",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    dateOption: "TODAY" | "CUSTOM",

    @SlashOption({
      name: "custom_date",
      description: "The custom start date of the tournament (YYYY-MM-DD)",
      type: ApplicationCommandOptionType.String,
      required: false,
    })
    customDate: string | undefined,

    @SlashChoice({ name: "Solo", value: "SOLO" })
    @SlashChoice({ name: "Duo", value: "DUO" })
    @SlashChoice({ name: "Trios", value: "TRIOS" })
    @SlashOption({
      name: "game_type",
      description: "The type of game for the tournament",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    gameType: "SOLO" | "DUO" | "TRIOS",

    interaction: CommandInteraction
  ) {
    try {
      let startDate: Date;

      if (dateOption === "TODAY") {
        startDate = new Date();
      } else if (dateOption === "CUSTOM") {
        if (!customDate) {
          throw new Error(
            "Custom date is required when 'Custom Date' option is selected."
          );
        }
        startDate = new Date(customDate);
        if (isNaN(startDate.getTime())) {
          throw new Error("Invalid date format. Please use YYYY-MM-DD.");
        }
      } else {
        throw new Error("Invalid date option selected.");
      }

      const tournament = await prisma.tournament.create({
        data: {
          tournament_name: tournamentName,
          game_type: gameType,
          start_date: startDate,
          status: "PENDING",
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
