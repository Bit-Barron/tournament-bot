import { Discord, Guard, Slash, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";
import { getStatusColor } from "../../lib/helpers.js";
import { ChannelOnly } from "../../guards/ChanelOnly.js";

@Discord()
export class TournamentStatus {
  @Slash({
    name: "tournament-status",
    description: "Get the status of a tournament",
  })
  @Guard(ChannelOnly("TOURNAMENT_INFO_CHANNEL"))
  async getTournamentStatus(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to get the status of",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    tournamentId: string,
    interaction: CommandInteraction
  ) {
    try {
      const id = parseInt(tournamentId, 10);

      if (isNaN(id) || id <= 0 || id > Number.MAX_SAFE_INTEGER) {
        throw new Error("Invalid tournament ID");
      }

      const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: { participants: true },
      });

      if (!tournament) {
        throw new Error("Tournament not found");
      }

      const embed = new EmbedBuilder()
        .setColor(getStatusColor(tournament.status))
        .setTitle(`🏆 Tournament Status: ${tournament.tournament_name}`)
        .addFields(
          { name: "Tournament ID", value: `${tournament.id}`, inline: true },
          { name: "Game Type", value: tournament.game_type, inline: true },
          { name: "Status", value: tournament.status, inline: true },
          {
            name: "Start Date",
            value: tournament.start_date.toDateString(),
            inline: true,
          },
          {
            name: "Participants",
            value: `${tournament.participants.length}`,
            inline: true,
          }
        )
        .setFooter({ text: "Use /tournament-help for more commands" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error getting tournament status:", error);
      await interaction.reply({
        content: `Error: ${
          error instanceof Error ? error.message : "An unknown error occurred"
        }. Please ensure you've entered a valid tournament ID.`,
        ephemeral: true,
      });
    }
  }
}
