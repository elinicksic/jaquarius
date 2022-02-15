import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, CacheType } from "discord.js";
import Bot from "../bot";
import Command from "../command";

export class LoopQueueCommand extends Command {
  data = new SlashCommandBuilder()
    .setName("loopqueue")
    .setDescription("Loops the queue.");
  execute(client: Bot, interaction: CommandInteraction): void {
    const queue = client.queues.get(interaction.guildId);
    if (!queue) {
      interaction.reply("There is no queue!");
      return;
    }

    queue.isQueueLooped = !queue.isQueueLooped;
    interaction.reply(queue.isQueueLooped ? "Looping the queue..." : "No longer looping queue.");
  }

}