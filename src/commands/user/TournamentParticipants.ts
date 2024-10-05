import { Discord, Slash, SlashOption } from "discordx";
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import prisma from "../../lib/prisma.js";

const PARTICIPANTS_PER_PAGE = 10;

@Discord()
export class TournamentParticipants {
  @Slash({
    name: "tournament-participants",
    description: "List all participants in a tournament",
  })
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
        throw new Error(`Tournament with ID ${tournamentId} not found.`);
      }

      const participants = tournament.participants.map((participant, index) => {
        return `${index + 1}. ${participant.username} (${
          participant.brawlstars_id
        })`;
      });

      const totalPages = Math.ceil(participants.length / PARTICIPANTS_PER_PAGE);

      const generateEmbed = (page: number) => {
        const start = (page - 1) * PARTICIPANTS_PER_PAGE;
        const end = start + PARTICIPANTS_PER_PAGE;
        const pageParticipants = participants.slice(start, end);

        return new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`🏆 Participants: ${tournament.tournament_name}`)
          .setDescription(pageParticipants.join("\n"))
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
            .setDisabled(currentPage === 1),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === totalPages)
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
        if (i.customId === "previous") {
          currentPage--;
        } else if (i.customId === "next") {
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
