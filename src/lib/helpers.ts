import { CommandInteraction, GuildMember } from "discord.js";

export function isAdmin(interaction: CommandInteraction) {
  const member = interaction.member as GuildMember;
  if (!member.roles.cache?.has("1291921873252122697")) {
    return false;
  }
  return true;
}
