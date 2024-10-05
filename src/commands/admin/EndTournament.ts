import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import prisma from "../../lib/prisma.js";

@Discord()
export class EndTournament {
  @Slash({
    name: "end",
    description: "End a tournament",
  })
  async endTournament(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to end",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    tournamentId: string
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

      console.log(`Tournament ended: ${tournament.tournament_name}`);
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  }
}
