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
        .setName("url")
        .setDescription("The URL of the video you want to play")
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

    const url = interaction.options.getString("url");
    if (!url) {
      interaction.reply("Something went wrong!");
      return;
    }

    youtubedl(url, {
      skipDownload: true,
      dumpSingleJson: true,
      defaultSearch: "ytsearch",
    })
      .then((output) => {
        const song: Song = {
          link: output.webpage_url,
          user: interaction.user,
          addedTime: Date.now(),
          length: output.duration,
          title: output.title,
        };

        queue.queue.push(song);

        if (queue.currentSong == null) {
          queue.next();
        }

        interaction.editReply(`Added ${output.title} to the queue!`);
      })
      .catch(() => {
        interaction.editReply("I can only play links to YouTube videos!");
      });

    interaction.deferReply();
  }
}

export default Play;
