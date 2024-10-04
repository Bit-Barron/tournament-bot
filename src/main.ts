import { Client } from "discordx";
import { GatewayIntentBits } from "discord.js";
import { log } from "console";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.TOKEN;

export const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

bot.once("ready", async () => {
  await bot.initApplicationCommands();
  log("Bot started");
});

const main = async () => {
  if (!token) {
    throw Error("Token is not provided");
  }

  await bot.login(token);
};

main();
