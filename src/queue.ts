import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioResource,
  StreamType,
} from "@discordjs/voice";
import { exec } from "youtube-dl-exec";
import { Song } from "./song";
import youtubedl from "youtube-dl-exec";
import { User } from "discord.js";

export class Queue {
  queue: Song[] = [];
  private player: AudioPlayer;
  isLooped = false;
  isQueueLooped = false;
  currentSong: Song | null = null;
  startTime: number | null = null;

  constructor(player: AudioPlayer) {
    this.player = player;

    player.on(AudioPlayerStatus.Idle, () => {
      // End of current song
      if (this.queue.length == 0 && !this.isLooped) {
        this.currentSong = null;
        return;
      }
      this.next();
    });
  }

  next() {
    this.currentSong = null;
    this.player.stop();

    const nextSong = this.isLooped ? this.currentSong : this.queue.shift();

    if (!nextSong) return;

    if (this.isQueueLooped && !this.isLooped) this.queue.push(nextSong);

    const subprocess = exec(nextSong.link, { format: "251", output: "-" });

    if (subprocess.stdout !== null) {
      const resource = createAudioResource(subprocess.stdout, {
        inputType: StreamType.WebmOpus,
      });
      this.player.play(resource);
      this.currentSong = nextSong;
      this.startTime = Date.now();
    }
  }

  add(query: string, user: User) {
    youtubedl(query, {
      skipDownload: true,
      dumpSingleJson: true,
      defaultSearch: "ytsearch",
    }).then((output) => {
      const song: Song = {
        link: output.webpage_url,
        user: user,
        addedTime: Date.now(),
        length: output.duration,
        title: output.title,
      };

      this.queue.push(song);
    });
  }
}
