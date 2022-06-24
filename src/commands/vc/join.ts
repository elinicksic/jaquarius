import { CommandInteraction } from "discord.js";
import { CommandOption } from "../../types/command";
import Bot from "../../bot";

export default function JoinCommand(interaction: CommandInteraction) {
  const client = Bot.instance;

  if (interaction.guildId == null) {
    interaction.reply("This can only be ran in a guild :(");
    return;
  }
  const queue = client.queues.get(interaction.guildId);
  if (!queue) {
    interaction.reply("There is no queue!");
    return;
  }

  queue.isLooped = !queue.isLooped;
  interaction.reply(queue.isLooped ? "Looping..." : "No longer looping.");
}

export const descripton = "Joins your voice channel.";

export const options: CommandOption[] = [
  {
    type: "string",
    name: "name",
    description: "Your name",
    required: false,
  },
];
