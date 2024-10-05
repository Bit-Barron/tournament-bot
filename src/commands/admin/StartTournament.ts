import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import prisma from "../../lib/prisma.js";

@Discord()
export class StartTournament {
  @Slash({
    name: "start",
    description: "Start a tournament",
  })
  async startTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to start",
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
          status: "ONGOING",
        },
      });

      await interaction.reply(
        `Tournament started: ${tournament.tournament_name}`
      );
    } catch (error) {
      await interaction.reply(`Error starting tournament: ${error}`);
    }
  }
}
