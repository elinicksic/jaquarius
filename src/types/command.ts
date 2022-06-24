export type ChannelType =
  | "GuildCategory"
  | "GuildNews"
  | "GuildNewsThread"
  | "GuildPrivateThread"
  | "GuildPublicThread"
  | "GuildStageVoice"
  | "GuildText"
  | "GuildStore"
  | "GuildVoice";

export type CommandOption = {
  name: string;
  description: string;
  required?: boolean;
} & (
  | {
      type: "boolean" | "mentionable" | "role" | "user";
    }
  | {
      type: "channel";
      channelTypes: ChannelType[];
    }
  | {
      type: "integer";
      autocomplete?: boolean;
      choices?: {
        name: string;
        value: number;
      }[];
      min?: number;
      max?: number;
    }
  | {
      type: "number";
      autocomplete?: boolean;
      choices?: {
        name: string;
        value: number;
      }[];
      min?: number;
      max?: number;
    }
  | {
      type: "string";
      autoComplete?: boolean;
      choices?: {
        name: string;
        value: string;
      }[];
    }
);
