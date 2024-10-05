import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";

type GameType = "SOLO" | "DUO" | "TRIOS";

@Discord()
export class TournamentCreate {
  @Slash({
    name: "tournament-create",
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
      const normalizedGameType = gameType.toUpperCase() as GameType;
      if (!["SOLO", "DUO", "TRIOS"].includes(normalizedGameType)) {
        throw new Error("Invalid game type. Must be SOLO, DUO, or TRIOS.");
      }

      const parsedDate = new Date(startDate);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format. Please use YYYY-MM-DD.");
      }

      const tournament = await prisma.tournament.create({
        data: {
          tournament_name: tournamentName,
          start_date: parsedDate,
          game_type: normalizedGameType,
        },
      });

      const embed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("🏆 New Tournament Created! 🏆")
        .setDescription(`**${tournamentName}** has been successfully created.`)
        .addFields(
          { name: "Tournament ID", value: `${tournament.id}`, inline: true },
          { name: "Game Type", value: normalizedGameType, inline: true },
          { name: "Start Date", value: startDate, inline: true },
          { name: "Status", value: "PENDING", inline: true }
        )
        .addFields(
          {
            name: "How to Join",
            value: `Use \`/join tournament_id:${tournament.id}\` to participate!`,
          },
          {
            name: "Starting the Tournament",
            value: `Organizers can use \`/tournament-start tournament_id:${tournament.id}\` when ready to begin.`,
          }
        )
        .setFooter({ text: "Good luck to all participants!" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error creating tournament:", error);
      await interaction.reply({
        content: `Error creating tournament: ${error}`,
        ephemeral: true,
      });
    }
  }
}
