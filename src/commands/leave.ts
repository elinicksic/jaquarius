import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import Bot from "../bot";
import Command from "../command";

export class LeaveCommand extends Command {
  data = new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the current voice channel.");
  execute(client: Bot, interaction: CommandInteraction): void {
    if (interaction.guildId == null) {
      interaction.reply("This can only be ran in a guild :(");
      return;
    }

    if (!interaction.guild?.me?.voice.channel) {
      interaction.reply(
        "How am I supposed to leave a channel that I didn't join?"
      );
      return;
    }

    interaction.guild?.me?.voice.disconnect();

    interaction.reply("Left the voice channel.");
  }
}
