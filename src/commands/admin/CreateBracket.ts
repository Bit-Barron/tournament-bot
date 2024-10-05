import { Discord, Guard, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { AdminOnly } from "../../guards/AdminOnly.js";

@Discord()
export class GenerateBracket {
  @Slash({
    name: "generate_bracket",
    description: "Generate a bracket for a tournament",
  })
  @Guard(AdminOnly())
  async generateBracket(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to generate a bracket for",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    tournamentId: number,
    interaction: CommandInteraction
  ) {
    try {
      await interaction.deferReply();

      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: true },
      });

      if (!tournament) {
        throw new Error(`Tournament with ID ${tournamentId} not found.`);
      }

      if (tournament.participants.length < 2) {
        throw new Error("Not enough participants to generate a bracket.");
      }

      const shuffledParticipants = this.shuffleArray([
        ...tournament.participants,
      ]);

      const bracket =
        this.generateSingleEliminationBracket(shuffledParticipants);

      const embed = new EmbedBuilder()
        .setTitle(`Bracket for ${tournament.tournament_name}`)
        .setDescription("Here's the generated single-elimination bracket:")
        .setColor("#0099ff");

      bracket.forEach((round, roundIndex) => {
        let roundField = "";
        round.forEach((match, matchIndex) => {
          roundField += `Match ${matchIndex + 1}: ${
            match[0]?.username || "BYE"
          } vs ${match[1]?.username || "BYE"}\n`;
        });
        embed.addFields({
          name: `Round ${roundIndex + 1}`,
          value: roundField || "No matches",
          inline: false,
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error generating bracket:", error);
      await interaction.editReply(`Error: ${error}`);
    }
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private generateSingleEliminationBracket(participants: any[]) {
    const bracket = [];
    let round = participants;

    while (round.length > 1) {
      const matches = [];
      for (let i = 0; i < round.length; i += 2) {
        matches.push([round[i], round[i + 1] || null]);
      }
      bracket.push(matches);
      round = matches.map((match) => match[0]);
    }

    return bracket;
  }
}
