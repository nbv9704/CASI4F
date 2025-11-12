export const SHOWCASE_LIMIT = 3;

export const SOCIAL_KEYS = ["discord", "twitter", "twitch", "youtube"];

export const SOCIAL_EMOJIS = {
  discord: "\u{1F4AC}",
  twitter: "\u{1D54F}",
  twitch: "\u{1F3AE}",
  youtube: "\u25B6\uFE0F",
};

export const SOCIAL_PLACEHOLDERS = {
  discord: "https://discord.gg/your-server",
  twitter: "https://twitter.com/username",
  twitch: "https://twitch.tv/channel",
  youtube: "https://youtube.com/@channel",
};

export const STATUS_OPTIONS = [
  {
    value: "online",
    indicator: "bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.55)]",
  },
  {
    value: "idle",
    indicator: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)]",
  },
  {
    value: "busy",
    indicator: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.55)]",
  },
  {
    value: "offline",
    indicator: "bg-slate-500/70",
  },
];

export const STATUS_MESSAGE_DURATION_OPTIONS = [
  { value: 30 },
  { value: 60 },
  { value: 240 },
  { value: 1440 },
];

export const DEFAULT_STATUS_DURATION_MINUTES = 60;
