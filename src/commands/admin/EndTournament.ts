import { Discord, Guard, Slash, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";
import { AdminOnly } from "../../guards/AdminOnly.js";
import { calculateDuration } from "../../lib/helpers.js";

@Discord()
export class EndTournament {
  @Slash({
    name: "tournament-end",
    description: "End a tournament",
  })
  @Guard(AdminOnly())
  async endTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to end",
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

      if (tournament.status === "COMPLETED") {
        throw new Error("This tournament has already ended");
      }

      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: "COMPLETED" },
      });

      const embed = new EmbedBuilder()
        .setColor("#FFD700")
        .setTitle("🏆 Tournament Ended! 🏆")
        .setDescription(
          `**${tournament.tournament_name}** has officially concluded.`
        )
        .addFields(
          { name: "Tournament ID", value: `${tournament.id}`, inline: true },
          { name: "Game Type", value: tournament.game_type, inline: true },
          { name: "Final Status", value: "COMPLETED", inline: true },
          {
            name: "Total Participants",
            value: `${tournament.participants.length}`,
            inline: true,
          },
          {
            name: "Duration",
            value: `${calculateDuration(tournament.start_date)}`,
            inline: true,
          }
        )
        .addFields(
          {
            name: "Next Steps",
            value:
              "Congratulations to all participants! Final results will be announced soon.",
          },
          {
            name: "Feedback",
            value:
              "Please use `/tournament-feedback` to share your thoughts on this tournament.",
          }
        )
        .setFooter({ text: "Thank you for participating!" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error ending tournament:", error);
      await interaction.reply({
        content: `Error ending tournament: ${error}`,
        ephemeral: true,
      });
    }
  }
}
