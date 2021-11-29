import { Client, Intents, Message, User } from 'discord.js';
import 'dotenv/config'

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', (msg: Message) => {
  if (msg.mentions.has(client.user as User)) {
    msg.react("👋")
  }
});

client.login(process.env.DISCORD_API_KEY);