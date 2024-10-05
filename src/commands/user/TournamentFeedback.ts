import { Discord, Slash } from "discordx";
import {
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../lib/prisma.js";

@Discord()
export class TournamentFeedback {
  @Slash({
    name: "tournament-feedback",
    description: "Submit feedback about a tournament",
  })
  async tournamentFeedback(interaction: CommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("tournamentFeedbackModal")
      .setTitle("Tournament Feedback");

    const tournamentNameInput = new TextInputBuilder()
      .setCustomId("tournamentName")
      .setLabel("Tournament Name")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const feedbackInput = new TextInputBuilder()
      .setCustomId("feedbackDescription")
      .setLabel("Your Feedback (max 100 characters)")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(100)
      .setRequired(true);

    const firstActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        tournamentNameInput
      );
    const secondActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(feedbackInput);

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
  }

  @Slash({
    name: "feedbacks",
    description: "View all tournament feedbacks",
  })
  async viewFeedbacks(interaction: CommandInteraction) {
    try {
      const feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: true,
          tournament: true,
        },
      });

      if (feedbacks.length === 0) {
        await interaction.reply({
          content: "No feedbacks have been submitted yet.",
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Tournament Feedbacks")
        .setDescription("Here are the most recent feedbacks:");

      feedbacks.forEach((feedback, index) => {
        embed.addFields({
          name: `Feedback ${index + 1}`,
          value: `Tournament: ${feedback.tournamentName}\nFeedback: ${
            feedback.feedbackText
          }\nSubmitted by: ${
            feedback.user?.username || "Anonymous"
          }\nSubmitted: ${feedback.createdAt.toLocaleString()}`,
        });
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      await interaction.reply({
        content:
          "An error occurred while fetching feedbacks. Please try again later.",
        ephemeral: true,
      });
    }
  }

  async onModalSubmit(interaction: ModalSubmitInteraction) {
    if (interaction.customId === "tournamentFeedbackModal") {
      const tournamentName =
        interaction.fields.getTextInputValue("tournamentName");
      const feedbackText = interaction.fields.getTextInputValue(
        "feedbackDescription"
      );

      try {
        const user = await prisma.user.findUnique({
          where: { discord_id: interaction.user.id },
        });

        const tournament = await prisma.tournament.findFirst({
          where: { tournament_name: tournamentName },
        });

        await prisma.feedback.create({
          data: {
            tournamentName,
            feedbackText,
            userId: user?.id,
            tournamentId: tournament?.id,
          },
        });

        await interaction.reply({
          content: `Thank you for your feedback!\n\nTournament: ${tournamentName}\nFeedback: ${feedbackText}`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error saving feedback:", error);
        await interaction.reply({
          content:
            "An error occurred while saving your feedback. Please try again later.",
          ephemeral: true,
        });
      }
    }
  }
}
