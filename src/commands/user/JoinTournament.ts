import { Discord, Guard, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { ChannelOnly } from "../../guards/ChanelOnly.js";

@Discord()
export class JoinTournament {
  @Slash({
    name: "tournament-join",
    description: "Join a tournament",
  })
  @Guard(ChannelOnly("TOURNAMENT_JOIN_LEAVE_CHANNEL"))
  async joinTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to join",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    tournamentId: number,
    @SlashOption({
      name: "brawlstars_id",
      description: "Your Brawl Stars player ID",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    brawlstarsId: string,
    @SlashOption({
      name: "username",
      description: "Your username",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    userName: string,
    interaction: CommandInteraction
  ) {
    try {
      await interaction.deferReply();

      const result = await prisma.$transaction(async (prisma) => {
        const tournament = await prisma.tournament.findUnique({
          where: { id: tournamentId },
          include: { participants: true },
        });

        if (!tournament) {
          throw new Error(`Tournament with ID ${tournamentId} not found.`);
        }

        if (tournament.participants.length >= tournament.max_participants) {
          throw new Error("This tournament is full.");
        }

        const existingParticipant = tournament.participants.find(
          (p) => p.discord_id === interaction.user.id
        );

        if (existingParticipant) {
          throw new Error("You have already joined this tournament.");
        }

        let user = await prisma.user.findUnique({
          where: { discord_id: interaction.user.id },
        });

        if (user) {
          user = await prisma.user.update({
            where: { discord_id: interaction.user.id },
            data: {
              brawlstars_id: brawlstarsId,
              username: userName,
            },
          });
        } else {
          user = await prisma.user.create({
            data: {
              discord_id: interaction.user.id,
              brawlstars_id: brawlstarsId,
              username: userName,
            },
          });
        }

        const updatedTournament = await prisma.tournament.update({
          where: { id: tournamentId },
          data: {
            participants: {
              connect: { id: user.id },
            },
          },
          include: {
            participants: true,
          },
        });

        return updatedTournament;
      });

      const participantCount = result.participants.length;

      await interaction.editReply(
        `Successfully joined the tournament. There are now ${participantCount} participant(s).`
      );
    } catch (error) {
      console.error("Error joining tournament:", error);

      await interaction.followUp({
        content: `Error joining tournament: ${error}`,
        ephemeral: true,
      });
    }
  }
}
