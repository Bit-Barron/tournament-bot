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
      type: ApplicationCommandOptionType.String,
    })
    tournamentId: string,
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
      const tournament = await prisma.user.create({
        data: {
          brawlstars_id: brawlstarsId,
          username: userName,
          tournaments: {
            connect: {
              id: parseInt(tournamentId),
            },
          },
        },
      });

      await interaction.reply(`Succefull: ${tournament.username}`);
    } catch (error) {
      await interaction.reply(`Error starting tournament: ${error}`);
    }
  }
}
