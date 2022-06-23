import { User } from "discord.js";

export type Song = {
  user: User;
  link: string;
  addedTime: number;
  length: number;
  title: string;
};
