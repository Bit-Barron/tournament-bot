import { Discord, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";

@Discord()
export class LeaveTournament {
  @Slash({
    name: "leave-tournament",
    description: "Leave a tournament",
  })
  async leaveTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to leave",
      type: ApplicationCommandOptionType.Integer,
    })
    tournamentId: number,
    interaction: CommandInteraction
  ) {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.findUnique({
          where: { discord_id: interaction.user.id },
        });

        if (!user) {
          throw new Error("You are not registered for any tournaments.");
        }

        const tournament = await prisma.tournament.findUnique({
          where: { id: tournamentId },
          include: { participants: true },
        });

        if (!tournament) {
          throw new Error(`Tournament with ID ${tournamentId} not found.`);
        }

        const isParticipant = tournament.participants.some(
          (p) => p.id === user.id
        );
        if (!isParticipant) {
          throw new Error("You are not a participant in this tournament.");
        }

        const updatedTournament = await prisma.tournament.update({
          where: { id: tournamentId },
          data: {
            participants: {
              disconnect: { id: user.id },
            },
          },
          include: { participants: true },
        });

        return updatedTournament;
      });

      const participantCount = result.participants.length;

      await interaction.reply(
        `You have successfully left the tournament. There are now ${participantCount} participant(s) remaining.`
      );
    } catch (error) {
      console.error("Error leaving tournament:", error);
      await interaction.reply(`Error: ${error}`);
    }
  }
}
