import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";

@Discord()
export class TournamentParticipants {
  @Slash({
    name: "tournament-participants",
    description: "List all participants in a tournament",
  })
  async listParticipants(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to list participants for",
      type: ApplicationCommandOptionType.Integer,
    })
    tournamentId: number,
    interaction: CommandInteraction
  ) {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          participants: true,
        },
      });

      if (!tournament) {
        throw new Error(`Tournament with ID ${tournamentId} not found.`);
      }

      const participants = tournament.participants.map((participant) => {
        return `${participant.username} (${participant.brawlstars_id})`;
      });

      await interaction.reply(
        `Participants for ${tournament.tournament_name}:\n${participants.join(
          "\n"
        )}`
      );
    } catch (err) {
      await interaction.reply(`Error joining tournament: ${err}`);
    }
  }
}
