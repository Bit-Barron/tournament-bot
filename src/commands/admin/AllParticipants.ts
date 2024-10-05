import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Discord, Slash, Guard, SlashOption } from "discordx";
import { AdminOnly } from "../../guards/AdminOnly.js";
import prisma from "../../lib/prisma.js";

@Discord()
export class AllParticipants {
  @Slash({
    name: "all-participants",
    description: "List all participants in a tournament",
  })
  @Guard(AdminOnly())
  async allParticipants(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to list participants for",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    tournamentId: string,
    interaction: CommandInteraction
  ) {
    try {
      await interaction.deferReply();

      const parsedTournamentId =
        this.validateAndParseTournamentId(tournamentId);

      const tournament = await prisma.tournament.findUnique({
        where: { id: parsedTournamentId },
        include: { participants: true },
      });

      if (!tournament) {
        throw new Error(`Tournament with ID ${parsedTournamentId} not found.`);
      }

      const participants = tournament.participants.map((p) => {
        return `<@${p.discord_id}>`;
      });

      const embed = new EmbedBuilder()
        .setTitle(`Participants for ${tournament.tournament_name}`)
        .setDescription(participants.join("\n"))
        .setColor("#0099ff");

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply(`An error occurred: ${error}`);
    }
  }

  private validateAndParseTournamentId(tournamentId: string) {
    const parsedTournamentId = parseInt(tournamentId);

    if (isNaN(parsedTournamentId)) {
      throw new Error("Invalid tournament ID provided.");
    }

    return parsedTournamentId;
  }
}
