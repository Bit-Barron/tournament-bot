import { GuildMember } from "discord.js";
import { Discord, On } from "discordx";

@Discord()
export class AddUser {
  @On({
    event: "guildMemberAdd",
  })
  async addUser(member: GuildMember) {
    try {
    } catch (err) {
      console.error(err);
    }
  }
}
