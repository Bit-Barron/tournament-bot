import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";
import { GameType } from "@prisma/client";

@Discord()
export class CreateTournament {
  @Slash({
    name: "tournament-create",
    description: "Create a new tournament",
  })
  async createTournament(
    @SlashOption({
      name: "tournament_name",
      description: "The name of the tournament",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    tournamentName: string,

    @SlashChoice(...Object.values(GameType))
    @SlashOption({
      name: "game_type",
      description: "The type of game for the tournament",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    gameType: GameType,

    @SlashOption({
      name: "max_participants",
      description: "The maximum number of participants allowed",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    maxParticipants: number,

    @SlashOption({
      name: "start_date",
      description: "The start date of the tournament (YYYY-MM-DD)",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    startDate: string,

    interaction: CommandInteraction
  ) {
    await interaction.deferReply();

    try {
      const tournament = await prisma.tournament.create({
        data: {
          tournament_name: tournamentName,
          game_type: gameType,
          max_participants: maxParticipants,
          start_date: new Date(startDate),
          status: "PENDING",
        },
      });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`🏆 New Tournament Created! 🏆`)
        .setDescription(`${tournamentName} has been successfully created.`)
        .addFields(
          { name: "Tournament ID", value: `${tournament.id}`, inline: true },
          { name: "Game Type", value: gameType, inline: true },
          { name: "Start Date", value: startDate, inline: true },
          { name: "Status", value: "PENDING", inline: true },
          {
            name: "How to Join",
            value: `Use \`/join tournament_id:${tournament.id}\` to participate!`,
          },
          {
            name: "Starting the Tournament",
            value: `Organizers can use \`/tournament-start tournament_id:${tournament.id}\` when ready to begin.`,
          }
        )
        .setFooter({
          text: `Good luck to all participants • ${new Date().toLocaleString()}`,
        });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error creating tournament:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Error Creating Tournament")
        .setDescription(
          `An error occurred while creating the tournament: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
        .setFooter({
          text: "Please try again or contact an administrator if the problem persists.",
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
}
