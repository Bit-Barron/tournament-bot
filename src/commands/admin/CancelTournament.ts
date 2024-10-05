import { Discord, Slash, SlashOption } from "discordx";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import prisma from "../../lib/prisma.js";

@Discord()
export class CancelTournament {
  @Slash({
    name: "cancel",
    description: "Cancel a tournament",
  })
  async cancelTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to cancel",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    tournamentId: string,

    interaction: CommandInteraction
  ) {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: {
          id: parseInt(tournamentId),
        },
      });

      if (!tournament) {
        throw new Error("Tournament not found");
      }

      await prisma.tournament.update({
        where: {
          id: parseInt(tournamentId),
        },
        data: {
          status: "COMPLETED",
        },
      });

      await interaction.reply(
        `Tournament cancelled: ${tournament.tournament_name}`
      );
    } catch (error) {
      await interaction.reply(`Error cancelling tournament: ${error}`);
    }
  }
}
