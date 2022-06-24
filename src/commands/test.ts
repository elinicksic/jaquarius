import { CommandInteraction } from "discord.js";
import { CommandOption } from "../../types/command";

export default function TestCommand(interaction: CommandInteraction) {
  interaction.reply("Hello!");
}

export const descripton = "Responds with hello.";

export const options: CommandOption[] = [
  {
    type: "string",
    name: "name",
    description: "Your name",
    required: false,
  },
];
