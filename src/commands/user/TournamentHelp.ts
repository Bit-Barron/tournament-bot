import { Discord, Slash } from "discordx";
import { CommandInteraction, EmbedBuilder } from "discord.js";

@Discord()
export class TournamentHelp {
  @Slash({
    name: "tournament-help",
    description: "Get help with tournament commands",
  })
  async getTournamentHelp(interaction: CommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🏆 Tournament Commands Help")
      .setDescription("Here's a list of all available tournament commands:")
      .addFields(
        { name: "/tournament-join", value: "Join an ongoing tournament" },
        {
          name: "/tournament-leave",
          value: "Leave a tournament you've joined",
        },
        { name: "/tournament-list", value: "View a list of all tournaments" },
        {
          name: "/tournament-me",
          value: "Check your tournament participation status",
        },
        {
          name: "/tournament-participants",
          value: "View participants of a specific tournament",
        },
        {
          name: "/tournament-status",
          value: "Check the status of a specific tournament",
        }
      )
      .setFooter({
        text: "For more details on each command, use them with no arguments",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
