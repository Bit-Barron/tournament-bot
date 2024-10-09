import { Discord, Slash } from "discordx";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import prisma from "../../lib/prisma.js";

@Discord()
export class MeCommand {
  @Slash({
    name: "tournament-me",
    description: "Display your user information and tournament participation",
  })
  async me(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const user = await prisma.user.findUnique({
        where: { discord_id: interaction.user.id },
        include: {
          participations: {
            include: {
              tournament: {
                include: {
                  _count: {
                    select: { participations: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        await interaction.editReply(
          "You haven't registered for any tournaments yet."
        );
        return;
      }

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`User Information for ${interaction.user.username}`)
        .addFields(
          { name: "Username", value: user.username, inline: true },
          { name: "Brawl Stars ID", value: user.brawlstars_id, inline: true },
          {
            name: "Registered Since",
            value: user.createdAt.toDateString(),
            inline: true,
          }
        );

      if (user.participations.length > 0) {
        embed.addFields({
          name: "Tournament Participation",
          value: `Participating in ${user.participations.length} tournament(s)`,
          inline: false,
        });

        user.participations.forEach((participation, index) => {
          const tournament = participation.tournament;
          embed.addFields(
            {
              name: `Tournament ${index + 1}`,
              value: tournament.tournament_name,
              inline: false,
            },
            { name: "ID", value: tournament.id.toString(), inline: true },
            { name: "Status", value: tournament.status, inline: true },
            { name: "Game Type", value: tournament.game_type, inline: true },
            {
              name: "Start Date",
              value: tournament.start_date.toDateString(),
              inline: true,
            },
            {
              name: "Participants",
              value: `${tournament._count.participations}/${tournament.max_participants}`,
              inline: true,
            },
            { name: "Hosted By", value: tournament.hosted_by, inline: true }
          );
        });
      } else {
        embed.addFields({
          name: "Tournament Participation",
          value: "Not participating in any tournaments",
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching user information:", error);
      await interaction.editReply(
        "An error occurred while fetching your information. Please try again later."
      );
    }
  }
}
