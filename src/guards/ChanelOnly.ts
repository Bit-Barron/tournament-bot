import { GuardFunction, SimpleCommandMessage } from "discordx";
import { CommandInteraction } from "discord.js";

export function ChannelOnly(
  channelEnvKey: string
): GuardFunction<CommandInteraction | SimpleCommandMessage> {
  return async (arg, client, next) => {
    const interaction = arg instanceof CommandInteraction ? arg : arg.message;
    const channelId = process.env[channelEnvKey];

    if (!channelId) {
      console.error(
        `Channel ID for ${channelEnvKey} is not set in environment variables`
      );
      await interaction.reply({
        content: "Server configuration error. Please contact an administrator.",
        ephemeral: true,
      });
      return;
    }

    if (interaction.channelId !== channelId) {
      console.log("Channel mismatch detected");
      await interaction.reply({
        content: `This command can only be used in <#${channelId}>.`,
        ephemeral: true,
      });
      return;
    }

    console.log("Channel check passed, calling next()");
    await next();
  };
}
