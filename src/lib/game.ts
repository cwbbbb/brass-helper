// 游戏核心类型与常量定义

export type PlayerColor = "red" | "yellow" | "purple" | "white";

export interface Player {
  id: string;
  color: PlayerColor;
  money: number;
  spentThisRound: number;
  // 收入轨位置（0-99），收入值由 trackToIncome 推导（非 1:1）
  incomeTrack: number;
  // 无限金钱模式：仅按回合内花费排顺位，金钱不限制也不扣减
  unlimitedMoney: boolean;
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

// 收入轨位置范围：0-99（99 为最高，不可再涨）
export const INCOME_TRACK_MIN = 0;
export const INCOME_TRACK_MAX = 99;

// 收入轨位置 → 收入值（非 1:1，参考 Brass: Birmingham 收入轨）：
//   [0-10]  ：每格 1（负收入区，-10 → 0）
//   (10-30] ：每两格 +1（0 → 10）
//   (30-60] ：每三格 +1（10 → 20）
//   (60-96] ：每四格 +1（20 → 29）
//   (96-99] ：每三格 +1（29 → 30）
// 每段用 ceil，使「该收入的最高一格」= 段首 + (收入 - 段首收入) × 每格数。
export function trackToIncome(track: number): number {
  const t = Math.max(INCOME_TRACK_MIN, Math.min(INCOME_TRACK_MAX, Math.floor(track)));
  if (t <= 10) return t - 10;                       // -10 .. 0
  if (t <= 30) return Math.ceil((t - 10) / 2);       // 0 .. 10
  if (t <= 60) return 10 + Math.ceil((t - 30) / 3);  // 10 .. 20
  if (t <= 96) return 20 + Math.ceil((t - 60) / 4);  // 20 .. 29
  return 29 + Math.ceil((t - 96) / 3);               // 29 .. 30
}

// 给定收入值，返回该收入对应的「最高一格」收入轨位置。
// 贷款降收入后即落在此处（如收入 20→17，落到轨位 51）。
export function maxTrackForIncome(income: number): number {
  if (income <= -10) return 0;                        // 收入 ≤ -10 → 轨位 0
  if (income <= 0) return income + 10;                // -10..0 → 轨位 0..10
  if (income <= 10) return 10 + income * 2;           // 0..10 → 轨位 10..30
  if (income <= 20) return 30 + (income - 10) * 3;    // 10..20 → 轨位 30..60
  if (income <= 29) return 60 + (income - 20) * 4;    // 20..29 → 轨位 60..96
  return INCOME_TRACK_MAX;                            // 30 → 轨位 99
}

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
