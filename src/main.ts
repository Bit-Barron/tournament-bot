import { Client } from "discordx";
import { GatewayIntentBits, Interaction, InteractionType } from "discord.js";
import { log } from "console";
import * as dotenv from "dotenv";
import { dirname, importx } from "@discordx/importer";

dotenv.config();

const token = process.env.TOKEN;

export const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  silent: false, // Set to true in production
});

bot.once("ready", async () => {
  await bot.initApplicationCommands();
  log("Bot started");
});

bot.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;

  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: false }).catch(() => {
        // If deferring fails, we'll try to execute the interaction anyway
        log("Failed to defer reply, attempting to execute interaction anyway");
      });
    }

    await bot.executeInteraction(interaction);
  } catch (error) {
    await handleErrorResponse(interaction, error);
  }
});

async function handleErrorResponse(interaction: Interaction, error: any) {
  console.error("Error handling interaction:", error);

  if (error.code === 10062) {
    log("Interaction expired, ignoring.");
    return;
  }

  if (!interaction.isRepliable()) return;

  const errorMessage =
    "An error occurred while processing the command. Please try again later.";

  try {
    if (interaction.deferred) {
      await interaction.editReply({ content: errorMessage });
    } else if (!interaction.replied) {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  } catch (replyError) {
    console.error("Error sending error message:", replyError);
  }
}

bot.on("messageCreate", (message) => void bot.executeCommand(message));

bot.on(
  "messageReactionAdd",
  (reaction, user) => void bot.executeReaction(reaction, user)
);

const main = async () => {
  try {
    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    if (!token) {
      throw Error("Could not find TOKEN in your environment");
    }

    await bot.login(token);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main().catch((error) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});
