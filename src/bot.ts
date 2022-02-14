import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v9";
import { Client, Collection, Intents, Interaction } from "discord.js";
import 'dotenv/config';
import Command from "./command";
import Join from "./commands/join";
import Ping from "./commands/ping";
import Play from "./commands/play";

class Bot extends Client {
  public config = process.env;
  public commands: Collection<string, Command> = new Collection();

  public constructor() {
    super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]});
  }

  public async init() {
    this.on('interactionCreate', async (interaction: Interaction) => {
      if (!interaction.isCommand()) return;

      this.commands.get(interaction.commandName)?.execute(this, interaction);
    });

    this.login(this.config.DISCORD_API_KEY);

    if (!this.config.DISCORD_API_KEY) {
      console.log("Please specify an API key in .env!");
      return;
    }

    if (!this.config.GUILD_ID) {
      console.log("Please specify an Guild ID in .env!");
      return;
    }

    if(!this.config.CLIENT_ID) {
      console.log("Please specify a Client ID .env!");
      return;
    }
    
    // Register commands
    this.registerCommand(new Ping());
    this.registerCommand(new Join());
    this.registerCommand(new Play());

    const commandRegister: any[] = []; 

    this.commands.forEach((command: Command) => {
      commandRegister.push(command.data.toJSON());
      console.log(`Registered command: ${command.data.toJSON}`);
    });

    const rest = new REST({ version: '9' }).setToken(this.config.DISCORD_API_KEY);

    rest.put(
      Routes.applicationGuildCommands(this.config.CLIENT_ID, this.config.GUILD_ID),
      { body: commandRegister }
    );
  }

  public registerCommand(command: Command) {
    this.commands.set(command.data.name, command);
  }
}

export default Bot;