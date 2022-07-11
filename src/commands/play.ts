import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import Command from "../command";
import youtubedl, { YtResponse } from "youtube-dl-exec";
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

    let newurl = query;

    // support for alternative frontends that use "v" for the video ID in the url. eg: invidious and piped
    if (!query.toLowerCase().includes("youtube.com")) {
      try {
        const url = new URL(query);
        newurl = `https://youtube.com/watch?v=${url.searchParams.get("v")}`;
      } catch {
        newurl = query;
      }
    }

    youtubedl(newurl, {
      skipDownload: true,
      dumpSingleJson: true,
      defaultSearch: "ytsearch",
    })
      // Problem with the youtube-dl library.
      // _type and entries are not including in the types.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
