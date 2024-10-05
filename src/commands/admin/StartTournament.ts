import { Discord, Slash, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";

@Discord()
export class StartTournament {
  @Slash({
    name: "tournament-start",
    description: "Start a tournament",
  })
  async startTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to start",
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

      if (tournament.status === "ONGOING") {
        throw new Error("This tournament has already started");
      }

      await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: "ONGOING" },
      });

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎉 Tournament Started! 🎉")
        .setDescription(`**${tournament.tournament_name}** is now underway!`)
        .addFields(
          { name: "Tournament ID", value: `${tournament.id}`, inline: true },
          { name: "Game Type", value: tournament.game_type, inline: true },
          {
            name: "Start Date",
            value: tournament.start_date.toDateString(),
            inline: true,
          },
          {
            name: "Participants",
            value: `${tournament.participants.length}`,
            inline: true,
          },
          { name: "Status", value: "ONGOING", inline: true }
        )
        .addFields(
          {
            name: "Next Steps",
            value:
              "Participants should check their matchups and prepare for their first games!",
          },
          {
            name: "Reporting Results",
            value:
              "Use `/report-match tournament_id:[ID] winner:[WINNER_ID]` to report match results.",
          }
        )
        .setFooter({ text: "May the best player/team win!" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error starting tournament:", error);
      await interaction.reply({
        content: `Error starting tournament: ${error}`,
        ephemeral: true,
      });
    }
  }
}
