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
    try {
      const tournament = await prisma.tournament.create({
        data: {
          tournament_name: tournamentName,
          game_type: gameType,
          MAX_PARTICIPANTS: maxParticipants,
          start_date: new Date(startDate),
          status: "PENDING",
        },
      });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("Tournament Created Successfully")
        .setDescription(`A new tournament has been created!`)
        .addFields(
          { name: "Tournament Name", value: tournamentName, inline: true },
          { name: "Game Type", value: gameType, inline: true },
          {
            name: "Max Participants",
            value: `${maxParticipants}`,
            inline: true,
          },
          { name: "Start Date", value: startDate, inline: true },
          { name: "Tournament ID", value: `${tournament.id}`, inline: true },
          { name: "Status", value: tournament.status, inline: true }
        )
        .setFooter({ text: `Created by ${interaction.user.username}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error creating tournament:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Error Creating Tournament")
        .setDescription(
          `An error occurred while creating the tournament: ${error}`
        )
        .setFooter({
          text: "Please try again or contact an administrator if the problem persists.",
        })
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}
