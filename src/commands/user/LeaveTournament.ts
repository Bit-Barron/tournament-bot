import { Discord, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";

@Discord()
export class LeaveTournament {
  @Slash({
    name: "leave",
    description: "Leave a tournament",
  })
  async leaveTournament(
    @SlashOption({
      name: "brawlstars_id",
      description: "Your Brawl Stars player ID",
      type: ApplicationCommandOptionType.String,
    })
    brawlstarsId: string,
    interaction: CommandInteraction
  ) {
    try {
      const tournament = await prisma.user.delete({
        where: {
          brawlstars_id: brawlstarsId,
        },
      });

      await interaction.reply(`Leaved`);
    } catch (err) {
      console.error(err);
    }
  }
}
