import { Client } from "discordx";
import { GatewayIntentBits } from "discord.js";
import { log } from "console";
import * as dotenv from "dotenv";
import { dirname, importx } from "@discordx/importer";

dotenv.config();

const token = process.env.TOKEN;

export const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

bot.once("ready", async () => {
  await bot.initApplicationCommands();
  log("Bot started");
});

bot.on(
  "interactionCreate",
  (interaction) => void bot.executeInteraction(interaction)
);

bot.on("messageCreate", (message) => void bot.executeCommand(message));

bot.on(
  "messageReactionAdd",
  (reaction, user) => void bot.executeReaction(reaction, user)
);

const main = async () => {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  if (!token) {
    throw Error("Could not find TOKEN in your environment");
  }

  await bot.login(token);
};

main();