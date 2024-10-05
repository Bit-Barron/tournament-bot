import { Discord, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";

@Discord()
export class JoinTournament {
  @Slash({
    name: "join",
    description: "Join a tournament",
  })
  async joinTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to join",
      type: ApplicationCommandOptionType.Integer,
    })
    tournamentId: number,
    @SlashOption({
      name: "brawlstars_id",
      description: "Your Brawl Stars player ID",
      type: ApplicationCommandOptionType.String,
    })
    brawlstarsId: string,
    @SlashOption({
      name: "username",
      description: "Your username",
      type: ApplicationCommandOptionType.String,
    })
    userName: string,
    interaction: CommandInteraction
  ) {
    try {
      let user = await prisma.user.findUnique({
        where: { brawlstars_id: brawlstarsId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
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

      const participantCount = updatedTournament.participants.length;

      await interaction.reply(
        `Successfully joined the tournament. There are now ${participantCount} participant(s).`
      );
    } catch (error) {
      await interaction.reply(`Error joining tournament: ${error}`);
    }
  }
}
