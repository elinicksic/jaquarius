import { Message } from "discord.js";

module.exports = {
  events: [
    {
      name: "messageCreate",
      once: false,
      execute(message: Message) {
        if (
          !message.mentions.users.has(message.client.user?.id || "") &&
          !message.content.toLowerCase().includes("jaquarius")
        ) {
          return;
        }

        const emoji = message.client.emojis.cache.random();
        if (!emoji) {
          return;
        }

        message.react(emoji);
      },
    },
  ],
};
