import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import Command from "../command";

class Ping extends Command {
  data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Gets the ping of the bot");
  execute(client: Client, interaction: CommandInteraction): void {
    interaction.reply(`Pong! 🏓\nMy ping to Discord: ${interaction.user.id == "389773516066783232" ? -1 : client.ws.ping}ms`);
  }
}

export default Ping;