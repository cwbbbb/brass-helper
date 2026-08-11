import { create } from "zustand";
import {
  type GameState,
  type Player,
  type PlayerColor,
  COLOR_ORDER,
  INITIAL_MONEY,
  INCOME_TRACK_MAX,
  INCOME_TRACK_MIN,
  trackToIncome,
  maxTrackForIncome,
  deepClone,
} from "@/lib/game";

const STORAGE_KEY = "brass-helper-state-v1";

interface GameActions {
  // 设置页操作
  setPlayerCount: (count: number) => void;
  shufflePlayers: () => void;
  swapColor: (playerId: string) => void;
  setInitialMoney: (playerId: string, money: number) => void;
  setAllInitialMoney: (money: number) => void;
  setAllUnlimited: () => void;
  startGame: () => void;

  // 游戏主页操作
  adjustSpent: (playerId: string, delta: number) => void;
  adjustIncome: (playerId: string, delta: number) => void;
  adjustMoney: (playerId: string, delta: number) => void;
  takeLoan: (playerId: string) => void;
  repayLoan: (playerId: string) => void;
  endRound: () => void;
  rollback: () => void;
  backToSetup: () => void;
}

// 贷款规则：收入 −3（落到该收入的最高轨位），立即获得 $30
export const LOAN_INCOME_PENALTY = 3;
export const LOAN_MONEY_GAIN = 30;

type Store = GameState & GameActions & { hydrated: boolean };

// 生成短 id
function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// 创建初始玩家数组（按颜色顺序）
function createPlayers(count: number): Player[] {
  return COLOR_ORDER.slice(0, count).map((color) => ({
    id: uid(),
    color,
    money: INITIAL_MONEY[count] ?? 0,
    spentThisRound: 0,
    incomeTrack: 10,
    unlimitedMoney: false,
  }));
}

// Fisher–Yates 随机洗牌
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initialState(): GameState {
  return {
    players: createPlayers(4),
    round: 1,
    phase: "setup",
    history: [],
  };
}

// 持久化（仅 playing 阶段写盘，避免设置页中间态污染）
function persist(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 忽略存储异常 */
  }
}

function loadPersisted(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.players || !Array.isArray(parsed.players)) return null;
    // 迁移旧版 incomeLevel（1:1）→ incomeTrack（0-99 轨位）
    parsed.players = (parsed.players as unknown as Record<string, unknown>[]).map(
      (p) => {
        if (typeof p.incomeTrack === "number") return p as unknown as Player;
        const oldLevel = typeof p.incomeLevel === "number" ? p.incomeLevel : 0;
        const rest = { ...p };
        delete rest.incomeLevel;
        return { ...rest, incomeTrack: maxTrackForIncome(oldLevel) } as unknown as Player;
      },
    );
    return parsed;
  } catch {
    return null;
  }
}

export const useGameStore = create<Store>((set, get) => ({
  ...initialState(),
  hydrated: false,

  setPlayerCount: (count) =>
    set(() => {
      const players = createPlayers(count);
      return { players } as Partial<Store>;
    }),

  shufflePlayers: () =>
    set((state) => ({ players: shuffle(state.players) })),

  swapColor: (playerId) =>
    set((state) => {
      // 在剩余未使用颜色中循环切换
      const used = new Set(
        state.players.filter((p) => p.id !== playerId).map((p) => p.color),
      );
      const available = COLOR_ORDER.filter((c) => !used.has(c));
      const current = state.players.find((p) => p.id === playerId)?.color;
      const candidates = [...available, current].filter(Boolean) as PlayerColor[];
      // 优先切换到 available 的第一个；若没有可用则保持
      const nextColor = candidates[0] ?? current;
      if (!nextColor) return {} as Partial<Store>;
      return {
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, color: nextColor } : p,
        ),
      } as Partial<Store>;
    }),

  setInitialMoney: (playerId, money) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId
          ? { ...p, money: Math.max(0, money), unlimitedMoney: false }
          : p,
      ),
    })),

  setAllInitialMoney: (money) =>
    set((state) => ({
      players: state.players.map((p) => ({
        ...p,
        money: Math.max(0, money),
        unlimitedMoney: false,
      })),
    })),

  setAllUnlimited: () =>
    set((state) => ({
      players: state.players.map((p) => ({
        ...p,
        unlimitedMoney: true,
        money: 0,
      })),
    })),

  startGame: () =>
    set((state) => {
      const next: GameState = {
        players: state.players.map((p) => ({
          ...p,
          spentThisRound: 0,
          incomeTrack: 10,
        })),
        round: 1,
        phase: "playing",
        history: [],
      };
      persist(next);
      return { ...next, phase: "playing" } as Partial<Store>;
    }),

  adjustSpent: (playerId, delta) =>
    set((state) => ({
      players: state.players.map((p) => {
        if (p.id !== playerId) return p;
        // 无限金钱模式：只记花费排顺位，不扣金钱
        if (p.unlimitedMoney) {
          let eff = delta;
          if (eff < 0) eff = Math.max(eff, -p.spentThisRound);
          if (eff === 0) return p;
          return { ...p, spentThisRound: p.spentThisRound + eff };
        }
        // 钳制实际生效的 delta：
        // - 增加花费时不能超过现有金钱（扣减不能为负）
        // - 撤销花费时不能超过已记花费（回补不能多补）
        let effective = delta;
        if (effective > 0) effective = Math.min(effective, p.money);
        if (effective < 0) effective = Math.max(effective, -p.spentThisRound);
        if (effective === 0) return p;
        return {
          ...p,
          spentThisRound: p.spentThisRound + effective,
          money: p.money - effective,
        };
      }),
    })),

  adjustIncome: (playerId, delta) =>
    set((state) => ({
      players: state.players.map((p) => {
        if (p.id !== playerId) return p;
        // 沿收入轨移动一格（0-99），收入值由 trackToIncome 推导
        const nextTrack = Math.max(
          INCOME_TRACK_MIN,
          Math.min(INCOME_TRACK_MAX, p.incomeTrack + delta),
        );
        return { ...p, incomeTrack: nextTrack };
      }),
    })),

  adjustMoney: (playerId, delta) =>
    set((state) => ({
      players: state.players.map((p) => {
        if (p.id !== playerId) return p;
        // 无限金钱模式：金钱无需调整
        if (p.unlimitedMoney) return p;
        // 直接调整金钱（售卖铁煤等直接获得金钱）；不能为负
        return { ...p, money: Math.max(0, p.money + delta) };
      }),
    })),

  takeLoan: (playerId) =>
    set((state) => ({
      players: state.players.map((p) => {
        if (p.id !== playerId) return p;
        // 无限金钱模式：不需要贷款
        if (p.unlimitedMoney) return p;
        // 贷款：收入 −3，落到该收入的「最高一格」轨位，立即 +$30
        const income = trackToIncome(p.incomeTrack);
        return {
          ...p,
          incomeTrack: maxTrackForIncome(income - LOAN_INCOME_PENALTY),
          money: p.money + LOAN_MONEY_GAIN,
        };
      }),
    })),

  repayLoan: (playerId) =>
    set((state) => ({
      players: state.players.map((p) => {
        if (p.id !== playerId) return p;
        // 无限金钱模式：不需要撤回贷款
        if (p.unlimitedMoney) return p;
        // 撤回贷款：金钱 −$30（不能为负），收入 +3 落到该收入最高轨位
        if (p.money < LOAN_MONEY_GAIN) return p;
        const income = trackToIncome(p.incomeTrack);
        return {
          ...p,
          incomeTrack: Math.min(
            INCOME_TRACK_MAX,
            maxTrackForIncome(income + LOAN_INCOME_PENALTY),
          ),
          money: p.money - LOAN_MONEY_GAIN,
        };
      }),
    })),

  endRound: () =>
    set((state) => {
      // 1. 推入历史快照
      const snapshot = deepClone({
        players: state.players,
        round: state.round,
        phase: state.phase,
        history: [],
      });

      // 2. 稳定排序：按本回合花费升序（花费少者在前）
      const indexed = state.players.map((p, i) => ({ p, i }));
      indexed.sort((a, b) => {
        if (a.p.spentThisRound !== b.p.spentThisRound) {
          return a.p.spentThisRound - b.p.spentThisRound;
        }
        return a.i - b.i; // 同花费保持原顺序
      });
      const sortedPlayers = indexed.map(({ p }) => p);

      // 3. 发放收入到金钱，清零本回合花费（无限金钱模式不发放收入）
      const newPlayers = sortedPlayers.map((p) => ({
        ...p,
        money: p.unlimitedMoney ? p.money : p.money + trackToIncome(p.incomeTrack),
        spentThisRound: 0,
      }));

      const next: GameState = {
        players: newPlayers,
        round: state.round + 1,
        phase: "playing",
        history: [...state.history, snapshot],
      };
      persist(next);
      return { ...next } as Partial<Store>;
    }),

  rollback: () =>
    set((state) => {
      if (state.history.length === 0) return {} as Partial<Store>;
      const previous = state.history[state.history.length - 1];
      const next: GameState = {
        players: previous.players,
        round: previous.round,
        phase: "playing",
        history: state.history.slice(0, -1),
      };
      persist(next);
      return { ...next } as Partial<Store>;
    }),

  backToSetup: () =>
    set(() => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      const fresh = initialState();
      return { ...fresh, phase: "setup" } as Partial<Store>;
    }),
}));

// 应用启动时尝试从 localStorage 恢复（仅恢复 playing 阶段）
export function hydrateFromStorage() {
  const persisted = loadPersisted();
  if (persisted && persisted.phase === "playing") {
    useGameStore.setState({ ...persisted, hydrated: true });
  } else {
    useGameStore.setState({ hydrated: true });
  }
}
