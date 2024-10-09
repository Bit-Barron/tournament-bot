import { Discord, Guard, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { ChannelOnly } from "../../guards/ChanelOnly.js";

@Discord()
export class LeaveTournament {
  @Slash({
    name: "tournament-leave",
    description: "Leave a tournament",
  })
  @Guard(ChannelOnly("TOURNAMENT_JOIN_LEAVE_CHANNEL"))
  async leaveTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to leave",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    tournamentId: number,
    interaction: CommandInteraction
  ) {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        const participation = await prisma.participation.findFirst({
          where: {
            tournament: { id: tournamentId },
            user: { discord_id: interaction.user.id },
          },
          include: {
            tournament: {
              include: {
                participations: true,
              },
            },
          },
        });

        if (!participation) {
          throw new Error("You are not a participant in this tournament.");
        }

        await prisma.participation.delete({
          where: { id: participation.id },
        });

        return participation.tournament;
      });

      const participantCount = result.participations.length - 1;

      await interaction.reply(
        `You have successfully left the tournament. There are now ${participantCount} participant(s) remaining.`
      );
    } catch (error) {
      console.error("Error leaving tournament:", error);
      await interaction.reply({
        content: `Error: ${error}`,
        ephemeral: true,
      });
    }
  }
}
