import { Collection, Message, Typing } from "discord.js";

const frames = ["ooo", "Ooo", "OOo", "OOO", "oOO", "ooO"];

const typingIndicators: Collection<
  string,
  { message: Message; timer: NodeJS.Timeout }
> = new Collection();

let currentlyAnimating = 0;

setInterval(async () => {
  currentlyAnimating++;

  if (currentlyAnimating >= typingIndicators.size) {
    currentlyAnimating = 0;
  }

  const message = await typingIndicators
    .at(currentlyAnimating)
    ?.message.fetch()
    .catch(() => {
      return;
    });

  if (message == null) {
    return;
  }

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    if (message.content.slice(2, frame.length + 3) == frame + " ") {
      let nextFrame = i + 1;
      if (nextFrame >= frames.length) {
        nextFrame = 0;
      }
      message
        .edit(
          "**" + frames[nextFrame] + message.content.slice(frame.length + 2)
        )
        .catch(() => {
          return;
        });
      break;
    }
  }
}, 1500);

module.exports = {
  events: [
    {
      name: "messageCreate",
      once: false,
      execute(message: Message) {
        const key = message.author.id + message.channelId;

        if (typingIndicators.has(key)) {
          typingIndicators
            .get(key)
            ?.message.delete()
            .catch(() => {
              return;
            });
          clearTimeout(typingIndicators.get(key)?.timer);
          typingIndicators.delete(key);
        }
      },
    },
    {
      name: "typingStart",
      once: false,
      async execute(typing: Typing) {
        const key = typing.user.id + typing.channel.id;

        let message: Message;
        const currentTypingIndicator = typingIndicators.get(key);
        if (currentTypingIndicator != null) {
          clearTimeout(currentTypingIndicator.timer);
          message = currentTypingIndicator.message;
        } else {
          message = await typing.channel.send({
            content:
              "**" +
              frames[0] +
              " " +
              typing.member?.displayName +
              "** is typing...",
            allowedMentions: {
              parse: [],
            },
            flags: "SUPPRESS_EMBEDS",
          });
        }

        typingIndicators.set(key, {
          message: message,
          timer: setTimeout(
            (key) => {
              typingIndicators.get(key)?.message.delete();
              typingIndicators.delete(key);
            },
            10000,
            key
          ),
        });
      },
    },
  ],
};
