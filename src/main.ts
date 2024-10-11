import { Client } from "discordx";
import { GatewayIntentBits, Interaction } from "discord.js";
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
  try {
    // For slash commands, defer the reply immediately
    if (interaction.isChatInputCommand()) {
      await interaction.deferReply();
    }

    await bot.executeInteraction(interaction);
  } catch (error) {
    console.error("Error handling interaction:", error);
    if (error === 10062) {
      console.log("Interaction expired, ignoring.");
    } else {
      try {
        if (interaction.isRepliable()) {
          await interaction.followUp({
            content: "An error occurred while processing the command.",
            ephemeral: true,
          });
        }
      } catch (replyError) {
        console.error("Error sending error message:", replyError);
      }
    }
  }
});

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
