import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import Command from "../command";
import youtubedl from "youtube-dl-exec";
import Bot from "../bot";
import { Song } from "../song";

class Play extends Command {
  data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from a link")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The URL or Search Query of the video you want to play")
        .setRequired(true)
    ) as SlashCommandBuilder;
  execute(client: Bot, interaction: CommandInteraction): void {
    const member = interaction.member as GuildMember;
    if (!member.voice.channelId) {
      interaction.reply("You are not in a voice channel!");
      return;
    }

    if (interaction.guildId == null) {
      interaction.reply("This can only be ran in a guild :(");
      return;
    }

    const queue = client.queues.has(interaction.guildId)
      ? client.queues.get(interaction.guildId)
      : client.createQueue(member.voice.channelId);
    if (!queue) {
      interaction.reply("Something went wrong!");
      return;
    }

    const query = interaction.options.getString("query");
    if (!query) {
      interaction.reply("Something went wrong!");
      return;
    }

    youtubedl(query, {
      skipDownload: true,
      dumpSingleJson: true,
      defaultSearch: "ytsearch",
    })
      .then((output: any) => {
        // When you use /play <query> instead of providing a link it returns a playlist
        const isPlaylist = output._type === "playlist";
        const result = isPlaylist ? output.entries[0] : output;

        const song: Song = {
          link: result.webpage_url,
          user: interaction.user,
          addedTime: Date.now(),
          length: result.duration,
          title: result.title,
        };

        queue.queue.push(song);

        if (queue.currentSong == null) {
          queue.next();
        }

        interaction.editReply(`Added ${song.title} to the queue!`);
      })
      .catch((e) => {
        interaction.editReply("Something went wrong finding your query!");
        interaction.editReply(e.message);
      });

    interaction.deferReply();
  }
}

export default Play;
