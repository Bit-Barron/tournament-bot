import { Discord, Slash, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";
import { getStatusColor } from "../../lib/helpers.js";

@Discord()
export class TournamentStatus {
  @Slash({
    name: "tournament-status",
    description: "Get the status of a tournament",
  })
  async getTournamentStatus(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to get the status of",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    tournamentId: number,
    interaction: CommandInteraction
  ) {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
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
        content: `Error getting tournament status: ${error}`,
        ephemeral: true,
      });
    }
  }
}
