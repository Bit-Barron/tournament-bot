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
      description: "Your Brawl Stars player ID (max 40 characters)",
      type: ApplicationCommandOptionType.String,
      required: true,
      maxLength: 40,
    })
    brawlstarsId: string,
    @SlashOption({
      name: "username",
      description: "Your username (max 40 characters)",
      type: ApplicationCommandOptionType.String,
      required: true,
      maxLength: 40,
    })
    userName: string,
    interaction: CommandInteraction
  ) {
    try {
      await interaction.deferReply();

      if (brawlstarsId.length > 40 || userName.length > 40) {
        throw new Error(
          "Brawl Stars ID and username must be 40 characters or less."
        );
      }

      const result = await prisma.$transaction(async (prisma) => {
        const existingParticipation = await prisma.participation.findFirst({
          where: {
            user: {
              discord_id: interaction.user.id,
            },
            tournament: {
              status: {
                in: ["PENDING", "ONGOING"],
              },
            },
          },
          include: {
            tournament: {
              select: {
                id: true,
                tournament_name: true,
              },
            },
          },
        });

        if (existingParticipation) {
          throw new Error(
            `You are already participating in tournament "${existingParticipation.tournament.tournament_name}" (ID: ${existingParticipation.tournament.id}). You can only join one tournament at a time.`
          );
        }

        const tournament = await prisma.tournament.findUnique({
          where: { id: tournamentId },
          include: { participations: true },
        });

        if (!tournament) {
          throw new Error(`Tournament with ID ${tournamentId} not found.`);
        }

        if (tournament.participations.length >= tournament.max_participants) {
          throw new Error("This tournament is full.");
        }

        let user = await prisma.user.upsert({
          where: { discord_id: interaction.user.id },
          update: {
            brawlstars_id: brawlstarsId,
            username: userName,
          },
          create: {
            discord_id: interaction.user.id,
            brawlstars_id: brawlstarsId,
            username: userName,
          },
        });

        const newParticipation = await prisma.participation.create({
          data: {
            userId: user.id,
            tournamentId: tournament.id,
          },
          include: {
            tournament: {
              include: {
                participations: true,
              },
            },
          },
        });

        return newParticipation;
      });

      const participantCount = result.tournament.participations.length;

      await interaction.editReply(
        `Successfully joined the tournament "${result.tournament.tournament_name}". There are now ${participantCount} participant(s).`
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
