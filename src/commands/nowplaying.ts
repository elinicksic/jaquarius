import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import Bot from "../bot";
import Command from "../command";

export class NowPlayingCommand extends Command {
  data = new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Tells you what is currently playing.");
  execute(client: Bot, interaction: CommandInteraction): void {
    if (interaction.guildId == null) {
      interaction.reply("This can only be ran in a guild :(");
      return;
    }
    const queue = client.queues.get(interaction.guildId);
    if (!queue) {
      interaction.reply("There is no queue!");
      return;
    }
    const song = queue.currentSong;

    if (!song || !queue.startTime) {
      interaction.reply("There is nothing playing.");
      return;
    }
    // ${Date.now() - (queue.startTime + song.length)}
    const timeRemaining = queue.startTime + song.length * 1000 - Date.now();
    interaction.reply(
      `Currently playing${queue.isLooped ? " (LOOPED)" : ""}\n*${
        song.title
      }*\nIt is ${Math.floor(song.length / 60)}:${this.padNumber(
        song.length % 60
      )} long with ${Math.floor(timeRemaining / 60000)}:${this.padNumber(
        Math.floor(timeRemaining / 1000) % 60
      )} remaining.`
    );
  }

  padNumber(num: number) {
    return (num < 10 ? "0" : "") + num;
  }
}
