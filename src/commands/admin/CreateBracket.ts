import { Discord, Guard, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { AdminOnly } from "../../guards/AdminOnly.js";
import { Prisma } from "@prisma/client";

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
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    tournamentId: string,
    interaction: CommandInteraction
  ) {
    try {
      await interaction.deferReply();

      // Validate and parse the tournament ID
      const parsedTournamentId =
        this.validateAndParseTournamentId(tournamentId);

      const tournament = await prisma.tournament.findUnique({
        where: { id: parsedTournamentId },
        include: { participants: true },
      });

      if (!tournament) {
        throw new Error(`Tournament with ID ${parsedTournamentId} not found.`);
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
      const errorMessage = this.getErrorMessage(error);
      await interaction.editReply({ content: errorMessage });
    }
  }

  private validateAndParseTournamentId(tournamentId: string): number {
    const parsedId = parseInt(tournamentId, 10);
    if (isNaN(parsedId) || parsedId <= 0 || parsedId > 2147483647) {
      throw new Error(
        "Invalid tournament ID. Please provide a valid positive integer."
      );
    }
    return parsedId;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return "A database constraint was violated. Please try again with different input.";
      } else if (error.code === "P2025") {
        return "The requested record was not found in the database.";
      }
    }
    return `An error occurred: ${
      error instanceof Error ? error.message : String(error)
    }`;
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
