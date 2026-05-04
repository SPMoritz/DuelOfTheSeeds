export const TILE = 16;
export const GAME_W = 240;
export const GAME_H = 400;

export const COLS = Math.floor(GAME_W / TILE);  // 15
export const VISIBLE_ROWS = Math.floor(GAME_H / TILE); // 25

export const LEVEL_ROWS = 80;

export const WALL_TILE = 1;
export const PLATFORM_TILE = 2;
export const SPIKE_TILE = 3;
export const FINISH_TILE = 4;
export const LADDER_TILE = 5;

export const PLAYER_SPEED = 120;
export const PLAYER_JUMP = -280;
export const PLAYER_DASH_SPEED = 220;
export const PLAYER_DASH_DURATION = 150;
export const PLAYER_DASH_COOLDOWN = 600;
export const GRAVITY = 650;
export const COYOTE_TIME = 80;
export const JUMP_BUFFER = 100;

export const BOT_DIFFICULTY = {
  EASY: { speedMult: 0.6, mistakeChance: 0.3, reactionDelay: 300 },
  NORMAL: { speedMult: 0.8, mistakeChance: 0.15, reactionDelay: 150 },
  HARD: { speedMult: 0.95, mistakeChance: 0.05, reactionDelay: 50 },
  PERFECT: { speedMult: 1.0, mistakeChance: 0.0, reactionDelay: 0 },
};

export const COLORS = {
  BG: 0x1a1a2e,
  WALL: 0x4a4a5e,
  WALL_LIGHT: 0x5a5a6e,
  PLATFORM: 0x6b8e6b,
  PLATFORM_TOP: 0x7bae7b,
  SPIKE: 0xcc4444,
  FINISH: 0x44cc88,
  PLAYER: 0xe74c3c,
  PLAYER_CAPE: 0xcc3333,
  BOT: 0x3498db,
  BOT_DARK: 0x2980b9,
  GHOST: 0x88ccee,
  HUD_BG: 0x000000,
  HUD_TEXT: 0xffffff,
  GOLD: 0xf1c40f,
  SILVER: 0xbdc3c7,
  BRONZE: 0xcd7f32,
  STONE_DARK: 0x3d3d50,
  STONE_MID: 0x4a4a5e,
  STONE_LIGHT: 0x5e5e72,
  MOSS: 0x4a6b4a,
  TORCH_FIRE: 0xff8833,
  PORTAL_GREEN: 0x33ff88,
  SKY_TOP: 0x1a1a3e,
  SKY_BOTTOM: 0x2a3a5e,
};

export const SEED_WORDS = [
  'WOLF', 'BEAR', 'HAWK', 'LYNX', 'PIKE', 'STAG', 'CROW', 'FANG',
  'BOLT', 'FURY', 'GALE', 'IRON', 'JADE', 'KING', 'LAVA', 'MAZE',
  'NOVA', 'ONYX', 'PEAK', 'RIFT', 'SAGE', 'TUSK', 'VEIL', 'WARP',
  'APEX', 'BONE', 'CAVE', 'DUSK', 'EDGE', 'FLUX', 'GRIP', 'HAZE',
];
