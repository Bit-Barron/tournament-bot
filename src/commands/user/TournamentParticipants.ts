import { Discord, Guard, Slash, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import prisma from "../../lib/prisma.js";
import { ChannelOnly } from "../../guards/ChanelOnly.js";

const PARTICIPANTS_PER_PAGE = 10;

@Discord()
export class TournamentParticipants {
  @Slash({
    name: "tournament-participants",
    description: "List all participants in a tournament",
  })
  @Guard(ChannelOnly("TOURNAMENT_INFO_CHANNEL"))
  async listParticipants(
    @SlashOption({
      name: "tournament_id",
      description: "The ID of the tournament to list participants for",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    tournamentId: number,
    interaction: CommandInteraction
  ) {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          participants: true,
        },
      });

      if (!tournament) {
        await interaction.reply({
          content: `Tournament with ID ${tournamentId} not found.`,
          ephemeral: true,
        });
        return;
      }

      const participants = tournament.participants.map((participant, index) => {
        return `${index + 1}. ${participant.username} (${
          participant.brawlstars_id
        })`;
      });

      const totalPages = Math.max(
        1,
        Math.ceil(participants.length / PARTICIPANTS_PER_PAGE)
      );

      const generateEmbed = (page: number) => {
        const start = (page - 1) * PARTICIPANTS_PER_PAGE;
        const end = start + PARTICIPANTS_PER_PAGE;
        const pageParticipants = participants.slice(start, end);

        let description = pageParticipants.join("\n");
        if (description.length === 0) {
          description = "No participants found for this tournament.";
        }

        return new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`🏆 Participants: ${tournament.tournament_name}`)
          .setDescription(description)
          .addFields(
            { name: "Tournament ID", value: `${tournament.id}`, inline: true },
            {
              name: "Total Participants",
              value: `${participants.length}`,
              inline: true,
            },
            { name: "Status", value: tournament.status, inline: true }
          )
          .setFooter({ text: `Page ${page} of ${totalPages}` })
          .setTimestamp();
      };

      const generateButtons = (currentPage: number) => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 1 || participants.length === 0),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(
              currentPage === totalPages || participants.length === 0
            )
        );
        return row;
      };

      let currentPage = 1;
      const initialEmbed = generateEmbed(currentPage);
      const initialButtons = generateButtons(currentPage);

      const response = await interaction.reply({
        embeds: [initialEmbed],
        components: [initialButtons],
        fetchReply: true,
      });

      const collector = response.createMessageComponentCollector({
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "previous" && currentPage > 1) {
          currentPage--;
        } else if (i.customId === "next" && currentPage < totalPages) {
          currentPage++;
        }

        await i.update({
          embeds: [generateEmbed(currentPage)],
          components: [generateButtons(currentPage)],
        });
      });

      collector.on("end", () => {
        interaction.editReply({ components: [] });
      });
    } catch (error) {
      console.error("Error listing tournament participants:", error);
      await interaction.reply({
        content: `Error listing tournament participants: ${error}`,
        ephemeral: true,
      });
    }
  }
}
