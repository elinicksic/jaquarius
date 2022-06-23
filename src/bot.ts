import { REST } from "@discordjs/rest";
import { createAudioPlayer, DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { Routes } from "discord-api-types/v9";
import { Client, Collection, Interaction, Snowflake, VoiceChannel } from "discord.js";
import 'dotenv/config';
import { readdirSync } from "fs";
import path from "path";
import Command from "./command";
import Join from "./commands/join";
import { LoopCommand } from "./commands/loop";
import { LoopQueueCommand } from "./commands/loopqueue";
import { NowPlayingCommand } from "./commands/nowplaying";
import Ping from "./commands/ping";
import Play from "./commands/play";
import { QueueCommand } from "./commands/queue";
import { SkipCommand } from "./commands/skip";
import { Queue } from "./queue";

class Bot extends Client {
  public config = process.env;
  public commands: Collection<string, Command> = new Collection();
  public queues: Collection<Snowflake, Queue> = new Collection();

  public constructor() {
    super({ intents: [
      "GUILDS", 
      "GUILD_VOICE_STATES", 
      "GUILD_MESSAGES", 
      "GUILD_MESSAGE_TYPING",
    ]});
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
    this.registerCommand(new QueueCommand());
    this.registerCommand(new NowPlayingCommand());
    this.registerCommand(new SkipCommand());
    this.registerCommand(new LoopCommand());
    this.registerCommand(new LoopQueueCommand());
    
    const commandRegister: unknown[] = []; 

    this.commands.forEach((command: Command) => {
      commandRegister.push(command.data.toJSON());
    });

    const rest = new REST({ version: '9' }).setToken(this.config.DISCORD_API_KEY);

    rest.put(
      Routes.applicationGuildCommands(this.config.CLIENT_ID, this.config.GUILD_ID),
      { body: commandRegister }
    );

    this.on("ready", (client) => {
      console.log("Logged in as " + client.user.tag)
    });

    await this.registerListeners()
  }

  private async registerListeners() {
    const listenersPath = path.join(__dirname, "listeners");
    const listenerFiles = readdirSync(listenersPath).filter(file => file.endsWith(".js"));

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

  private registerCommand(command: Command) {
    this.commands.set(command.data.name, command);
  }

  public createQueue(channelId: Snowflake): Queue | null{
    const channel: VoiceChannel = this.channels.cache.get(channelId) as VoiceChannel;
    if (!channel) return null;
    const connection = joinVoiceChannel({ 
      channelId: channel.id, 
      guildId: channel.guildId, 
      adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
    });
    const player = createAudioPlayer({});
    connection.subscribe(player);

    const queue = new Queue(player);
    this.queues.set(channel.guildId, queue);
    return queue;
  }
}

export default Bot;