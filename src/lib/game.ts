// 游戏核心类型与常量定义

export type PlayerColor = "red" | "yellow" | "purple" | "white";

export interface Player {
  id: string;
  color: PlayerColor;
  money: number;
  spentThisRound: number;
  incomeLevel: number;
}

export interface GameState {
  players: Player[];
  round: number;
  phase: "setup" | "playing";
  history: GameState[];
}

// 各人数的默认初始资金（依据 Brass: Birmingham 规则）
export const INITIAL_MONEY: Record<number, number> = {
  2: 30,
  3: 20,
  4: 17,
};

// 收入轨等级：允许负数（现实中可表示贷款/负债态），设一个宽松上限防误触
export const INCOME_LEVEL_MIN = -Infinity;
export const INCOME_LEVEL_MAX = 100;

// 玩家颜色配置
export const PLAYER_COLORS: Record<
  PlayerColor,
  { bg: string; bgLight: string; text: string; label: string; stripe: string }
> = {
  red: {
    bg: "#c83232",
    bgLight: "#d94545",
    text: "#fff",
    label: "红",
    stripe: "player-stripe-red",
  },
  yellow: {
    bg: "#e0b020",
    bgLight: "#f0c040",
    text: "#1a1a1a",
    label: "黄",
    stripe: "player-stripe-yellow",
  },
  purple: {
    bg: "#7b3fa0",
    bgLight: "#9050c0",
    text: "#fff",
    label: "紫",
    stripe: "player-stripe-purple",
  },
  white: {
    bg: "#e8e8e8",
    bgLight: "#ffffff",
    text: "#1a1a1a",
    label: "白",
    stripe: "player-stripe-white",
  },
};

export const COLOR_ORDER: PlayerColor[] = ["red", "yellow", "purple", "white"];

// 顺位徽章：1st / 2nd / 3rd / 4th
export function positionBadge(pos: number): string {
  if (pos === 1) return "1st";
  if (pos === 2) return "2nd";
  if (pos === 3) return "3rd";
  return `${pos}th`;
}

// 深拷贝（用于历史快照）
export function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
