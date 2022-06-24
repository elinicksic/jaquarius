import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import Bot from "../bot";
import Command from "../command";

export class QueueCommand extends Command {
  data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Lists the contents of the queue.");
  execute(client: Bot, interaction: CommandInteraction): void {
    if (interaction.guildId == null) {
      interaction.reply("This can only be ran in a guild :(");
      return;
    }

    const queue = client.queues.get(interaction.guildId);
    if (!queue) {
      interaction.reply("There is no queue. Why not start one with /play?");
      return;
    }

    let list = "__**The Queue**__";
    for (let i = 0; i < queue.queue.length; i++) {
      const song = queue.queue[i];
      list += `\n${i + 1}. ${song.title} (added by ${song.user.username})`;
    }

    interaction.reply(list);
  }
}
