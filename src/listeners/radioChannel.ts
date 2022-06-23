import "dotenv/config";
import { Message } from "discord.js";

module.exports = {
  events: [
    {
      name: "messageCreate",
      once: false,
      execute(message: Message) {
        if (!(message.channel.id === process.env.RADIO_CHANNEL_ID)) {
          return;
        }
        // TODO: get client object here
        // const queue = client.queues.get(process.env.GUILD_ID);
      },
    },
  ],
};
