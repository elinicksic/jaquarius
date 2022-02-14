import { SlashCommandBuilder } from "@discordjs/builders";
import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { Client, CommandInteraction, CacheType, GuildMember, VoiceChannel } from "discord.js";
import Command from "../command";

class Join extends Command {
  data = new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins your voice channel");
  execute(client: Client, interaction: CommandInteraction): void {
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel;
    if (!channel) {
      interaction.reply("You are not in a voice channel!");
      return;
    }
    joinVoiceChannel({channelId: channel?.id, guildId: channel.guildId, adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator});
    interaction.reply(`Okay, I joined your channel!`);
  }
}

export default Join;