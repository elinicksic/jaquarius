import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import {
  createAudioPlayer,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
} from "@discordjs/voice";
import { ChannelType, Routes } from "discord-api-types/v9";
import {
  Client,
  Collection,
  Interaction,
  Snowflake,
  VoiceChannel,
} from "discord.js";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { CommandOption } from "./types/command";
import { Queue } from "./queue";
import { ChannelTypes } from "discord.js/typings/enums";

export default class Bot extends Client {
  public static instance: Bot;

  public config = process.env;
  //public commands: Collection<string, Command> = new Collection();
  public queues: Collection<Snowflake, Queue> = new Collection();

  public constructor() {
    super({
      intents: [
        "GUILDS",
        "GUILD_VOICE_STATES",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_TYPING",
      ],
    });

    Bot.instance = this;
  }

  public async init() {
    this.on("interactionCreate", async (interaction: Interaction) => {
      if (!interaction.isCommand()) return;

      //this.commands.get(interaction.commandName)?.execute(this, interaction);
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

    if (!this.config.CLIENT_ID) {
      console.log("Please specify a Client ID .env!");
      return;
    }

    // Register commands
    // this.registerCommand(new Ping());
    // this.registerCommand(new Join());
    // this.registerCommand(new Play());
    // this.registerCommand(new QueueCommand());
    // this.registerCommand(new NowPlayingCommand());
    // this.registerCommand(new SkipCommand());
    // this.registerCommand(new LoopCommand());
    // this.registerCommand(new LoopQueueCommand());

    const commandRegister: unknown[] = [];

    /*this.commands.forEach((command: Command) => {
      commandRegister.push(command.data.toJSON());
    });*/

    const rest = new REST({ version: "9" }).setToken(
      this.config.DISCORD_API_KEY
    );

    rest.put(
      Routes.applicationGuildCommands(
        this.config.CLIENT_ID,
        this.config.GUILD_ID
      ),
      { body: commandRegister }
    );

    this.on("ready", (client) => {
      console.log("Logged in as " + client.user.tag);
    });

    await this.registerListeners();
    await this.registerCommands();
  }

  private async registerCommands() {
    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = fs.readdirSync(commandsPath);
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const fileStats = fs.statSync(filePath);
      if (fileStats.isFile()) {
        if (!file.endsWith(".js")) continue;

        console.log(await import(filePath));
        // const Executor: (interaction: Interaction) => void, {description, options} = await import(filePath);

        /*Executor;

        const builder = new SlashCommandBuilder()
          .setName(file.split('.')[0])
          .setDescription(description);

        if (options) {
          for (const i of options) {
            const option: CommandOption = i;
            switch (option.type) {
              case "boolean":
                builder.addBooleanOption((optionBuilder) =>
                  optionBuilder
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required || false)
                );
                break;
              case "channel":
                builder.addChannelOption((optionBuilder) => {
                  optionBuilder
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required || false);

                  for (const type of option.channelTypes) {
                    const builderType = ChannelType[type];

                    optionBuilder.addChannelType(builderType)
                  }
                  return optionBuilder
                }
                  
                  
                    
                );
                break;
              case "integer":
                builder.addIntegerOption((optionBuilder) =>
                  optionBuilder
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required || false)
                );
                break;
              case "mentionable":
                builder.addMentionableOption((optionBuilder) =>
                  optionBuilder
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required || false)
                );
                break;
              case "number":
                builder.addNumberOption((optionBuilder) =>
                  optionBuilder
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required || false)
                );
                break;
              case "role":
                builder.addRoleOption((optionBuilder) =>
                  optionBuilder
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required || false)
                );
                break;
              case "string":
                builder.addStringOption((optionBuilder) =>
                  optionBuilder
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required || false)
                );
                break;
              case "user":
                builder.addUserOption((optionBuilder) =>
                  optionBuilder
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required || false)
                );
                break;
            }
          }
        } else if (fileStats.isDirectory()) {
        }*/
      }
    }
  }

  //private async registerSubCommands(filePath: string) {}

  private async registerListeners() {
    const listenersPath = path.join(__dirname, "listeners");
    const listenerFiles = fs
      .readdirSync(listenersPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of listenerFiles) {
      const filePath = path.join(listenersPath, file);
      const command = await import(filePath);

      const events = command.events;

      for (const event of events) {
        if (event.once) {
          this.once(event.name, event.execute);
        } else {
          this.on(event.name, event.execute);
        }
      }
    }
  }

  /*private registerCommand(command: Command) {
    this.commands.set(command.data.name, command);
  }*/

  public createQueue(channelId: Snowflake): Queue | null {
    const channel: VoiceChannel = this.channels.cache.get(
      channelId
    ) as VoiceChannel;
    if (!channel) return null;
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild
        .voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });
    const player = createAudioPlayer({});
    connection.subscribe(player);

    const queue = new Queue(player);
    this.queues.set(channel.guildId, queue);
    return queue;
  }
}
