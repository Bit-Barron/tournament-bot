import { Discord, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";

@Discord()
export class TournamentStatus {
  @Slash({
    name: "status",
    description: "Get the status of a tournament",
  })
  async getTournamentStatus(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to get the status of",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    interaction: CommandInteraction
  ) {
    try {
      const tournament = await prisma.tournament.findFirst({});

      if (tournament) {
        await interaction.reply(`Tournament Status: ${tournament.status}`);
      }
      await interaction.reply("Tournament not found");
    } catch (err) {
      await interaction.reply(`Error cancelling tournament: ${err}`);
    }
  }
}
