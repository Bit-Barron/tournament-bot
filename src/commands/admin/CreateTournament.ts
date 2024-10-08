import { Discord, Guard, Slash, SlashChoice, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";
import { AdminOnly } from "../../guards/AdminOnly.js";

enum GameType {
  SOLO = "SOLO",
  DUO = "DUO",
  TRIOS = "TRIOS",
}

@Discord()
export class CreateTournament {
  @Slash({
    name: "tournament-create",
    description: "Create a new tournament",
  })
  @Guard(AdminOnly())
  async createTournament(
    @SlashOption({
      name: "tournament_name",
      description: "The name of the tournament (max 50 characters)",
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
      description: "The maximum number of participants allowed (1-50)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    maxParticipants: number,

    @SlashOption({
      name: "start_date",
      description: "The start date of the tournament (YYYY-MM-DD or 'today')",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    startDate: string,

    interaction: CommandInteraction
  ) {
    await interaction.deferReply();

    try {
      if (tournamentName.length > 50) {
        throw new Error("Tournament name cannot exceed 50 characters.");
      }

      if (
        maxParticipants < 1 ||
        maxParticipants > 50 ||
        !Number.isInteger(maxParticipants)
      ) {
        throw new Error(
          "Max participants must be an integer between 1 and 50."
        );
      }

      let parsedDate: Date;
      if (startDate.toLowerCase() === "today") {
        parsedDate = new Date();
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate)) {
          throw new Error(
            "Invalid date format. Please use YYYY-MM-DD or 'today'."
          );
        }
        parsedDate = new Date(startDate);
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid date. Please enter a valid date.");
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDate < today) {
          throw new Error("Start date must be today or a future date.");
        }
      }

      const hostUsername = interaction.user.username;

      const tournament = await prisma.tournament.create({
        data: {
          tournament_name: tournamentName,
          game_type: gameType,
          max_participants: maxParticipants,
          start_date: parsedDate,
          status: "PENDING",
          hosted_by: hostUsername,
        },
      });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`🏆 New Tournament Created! 🏆`)
        .setDescription(`${tournamentName} has been successfully created.`)
        .addFields(
          { name: "Tournament ID", value: `${tournament.id}`, inline: true },
          { name: "Game Type", value: gameType, inline: true },
          {
            name: "Start Date",
            value: parsedDate.toISOString().split("T")[0],
            inline: true,
          },
          { name: "Status", value: "PENDING", inline: true },
          { name: "Hosted By", value: hostUsername, inline: true },
          {
            name: "Max Participants",
            value: `${maxParticipants}`,
            inline: true,
          },
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
