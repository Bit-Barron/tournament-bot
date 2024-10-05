import { CommandInteraction, GuildMember } from "discord.js";

export function getStatusColor(status: string): number {
  switch (status) {
    case "PENDING":
      return 0xffa500;
    case "ONGOING":
      return 0x00ff00;
    case "COMPLETED":
      return 0x0000ff;
    case "CANCELLED":
      return 0xff0000;
    default:
      return 0x808080;
  }
}
