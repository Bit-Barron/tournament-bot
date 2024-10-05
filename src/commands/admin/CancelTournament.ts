import { Discord, Slash, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";

@Discord()
export class CancelTournament {
  @Slash({
    name: "tournament-cancel",
    description: "Cancel a tournament",
  })
  async cancelTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to cancel",
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
        throw new Error(
          "This tournament has already ended and cannot be cancelled"
        );
      }

      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: "CANCELED" },
      });

      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("❌ Tournament Cancelled ❌")
        .setDescription(`**${tournament.tournament_name}** has been cancelled.`)
        .addFields(
          { name: "Tournament ID", value: `${tournament.id}`, inline: true },
          { name: "Game Type", value: tournament.game_type, inline: true },
          { name: "Final Status", value: "CANCELLED", inline: true },
          {
            name: "Affected Participants",
            value: `${tournament.participants.length}`,
            inline: true,
          }
        )
        .addFields(
          {
            name: "Reason",
            value: "This tournament has been cancelled by an administrator.",
          },
          {
            name: "Next Steps",
            value:
              "All participants will be notified. We apologize for any inconvenience.",
          },
          {
            name: "Questions",
            value:
              "If you have any questions, please contact the tournament organizers.",
          }
        )
        .setFooter({ text: "We appreciate your understanding." })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error cancelling tournament:", error);
      await interaction.reply({
        content: `Error cancelling tournament: ${error}`,
        ephemeral: true,
      });
    }
  }
}
