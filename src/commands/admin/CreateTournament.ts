import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, Guard, SlashOption } from "discordx";
import { isAdmin } from "../../lib/helpers.js";

@Discord()
export class TournamentCommands {
  @Slash({
    name: "create-tournament",
    description: "Create a new tournament (Specific role only)",
  })
  @Guard(isAdmin)
  async createTournament(
    @SlashOption({
      name: "name",
      description: "The name of the tournament",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    @SlashOption({
      name: "participants",
      description: "The number of participants",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    })
    interaction: CommandInteraction
  ) {
    try {
      return "Tournament created!";
    } catch (error) {
      console.error("Error responding to slash command:", error);
    }
  }
}
