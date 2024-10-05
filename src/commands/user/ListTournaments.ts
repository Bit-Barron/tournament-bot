import { Discord, Slash } from "discordx";
import prisma from "../../lib/prisma.js";
import { CommandInteraction } from "discord.js";

@Discord()
export class ListTournaments {
  @Slash({
    name: "list",
    description: "List all tournaments",
  })
  async listTournaments(interaction: CommandInteraction) {
    try {
      const tournaments = await prisma.tournament.findMany();

      if (!tournaments) {
        await interaction.reply("No tournaments found");
      }
      await interaction.reply(
        `Tournaments: ${tournaments.map((t) => t.id).join(", ")}`
      );
    } catch (error) {
      await interaction.reply(`Error listing tournaments: ${error}`);
    }
  }
}
