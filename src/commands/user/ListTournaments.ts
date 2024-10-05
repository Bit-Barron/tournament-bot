import { Discord, Guard, Slash } from "discordx";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import prisma from "../../lib/prisma.js";
import { ChannelOnly } from "../../guards/ChanelOnly.js";

@Discord()
export class ListTournaments {
  @Slash({
    name: "tournament-list",
    description: "List all tournaments",
  })
  @Guard(ChannelOnly("TOURNAMENT_INFO_CHANNEL"))
  async listTournaments(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const tournaments = await prisma.tournament.findMany({
        orderBy: { tournament_name: "asc" },
      });

      if (tournaments.length === 0) {
        await interaction.editReply(
          "No tournaments found. Why not create one?"
        );
        return;
      }

      const embeds = this.createTournamentEmbeds(tournaments);

      await interaction.editReply({ embeds });
    } catch (error) {
      console.error("Error listing tournaments:", error);
      await interaction.editReply({
        content:
          "An error occurred while fetching the tournament list. Please try again later.",
      });
    }
  }

  private createTournamentEmbeds(tournaments: any[]): EmbedBuilder[] {
    const embeds: EmbedBuilder[] = [];
    const tournamentsPerEmbed = 25;

    for (let i = 0; i < tournaments.length; i += tournamentsPerEmbed) {
      const tournamentChunk = tournaments.slice(i, i + tournamentsPerEmbed);
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`Tournament List (${i / tournamentsPerEmbed + 1})`)
        .setDescription("Here are the available tournaments:")
        .addFields(
          tournamentChunk.map((t) => ({
            name: t.tournament_name,
            value: `ID: ${t.id}`,
            inline: true,
          }))
        )
        .setTimestamp();

      embeds.push(embed);
    }

    return embeds;
  }
}