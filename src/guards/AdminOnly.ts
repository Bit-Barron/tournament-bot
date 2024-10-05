import { GuardFunction, SimpleCommandMessage } from "discordx";
import { CommandInteraction, GuildMember } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

export function AdminOnly(): GuardFunction<
  CommandInteraction | SimpleCommandMessage
> {
  return async (arg, client, next) => {
    const interaction = arg instanceof CommandInteraction ? arg : arg.message;
    const member = interaction.member as GuildMember | null;
    const adminRoleId = process.env.ADMIN_ROLE;

    if (!adminRoleId) {
      console.error("ADMIN_ROLE is not set in environment variables");
      return;
    }

    if (!member) {
      await interaction.reply({
        content: "Unable to verify permissions.",
        ephemeral: true,
      });
      return;
    }

    const hasAdminRole =
      member.roles instanceof Map
        ? member.roles.has(adminRoleId)
        : member.roles.cache
        ? member.roles.cache.has(adminRoleId)
        : Array.isArray(member.roles)
        ? member.roles.includes(adminRoleId)
        : false;

    if (hasAdminRole) {
      await next();
    } else {
      await interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }
  };
}
