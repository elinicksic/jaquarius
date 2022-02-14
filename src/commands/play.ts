import { SlashCommandBuilder } from "@discordjs/builders";
import { AudioPlayerError, AudioPlayerState, createAudioPlayer, createAudioResource, getVoiceConnection, NoSubscriberBehavior, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import { Client, CommandInteraction } from "discord.js";
import Command from "../command";
import 'youtube-dl-exec'
import { exec } from "youtube-dl-exec";

class Play extends Command {
  data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from a link")
    .addStringOption(option => option
      .setName("url")
      .setDescription("The URL of the video you want to play")
      .setRequired(true)) as SlashCommandBuilder;
  execute(client: Client, interaction: CommandInteraction): void {
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
      interaction.reply("I am not in a voice channel! Use /join to connect me to your channel!");
      return;
    }

    if (connection.state.status != VoiceConnectionStatus.Ready) {
      interaction.reply("Connection not ready!");
      return;
    }

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    player.on("stateChange", (oldState: AudioPlayerState, newState: AudioPlayerState) => {
      console.log(`Audio player changed state from ${oldState.status.toString()} to ${newState.status.toString()}`);
    });

    player.on("error", (error: AudioPlayerError) => {
      console.log(error);
    });

    connection?.subscribe(player);

    const url = interaction.options.getString("url");

    if (!url) {
      interaction.reply("Something went wrong!");
      return;
    }

    const subprocess = exec(url, {format: "251", output: "-"});

    if(subprocess.stdout !== null) {
      const resource = createAudioResource(subprocess.stdout, {inputType: StreamType.WebmOpus});
      player.play(resource);
      interaction.reply("Ok, playing!");
    } else {
      interaction.reply("Something went wrong!");
    }
  }
}

export default Play;