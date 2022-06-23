import "dotenv/config";
import { Message } from "discord.js";

module.exports = {
  events: [
    {
      name: "messageCreate",
      once: false,
      execute(message: Message) {
        console.log("sus!");
        console.log(process.env.RADIO_CHANNEL_ID);
        if (!(message.channel.id === process.env.RADIO_CHANNEL_ID)) {
          return;
        }

        const queue = client.queues.get(process.env.GUILD_ID);
        console.log(message.content);
      },
    },
  ],
};
