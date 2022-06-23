import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";

abstract class Command {
  abstract data: SlashCommandBuilder;
  abstract execute(client: Client, interaction: CommandInteraction): void;
}

export default Command;
