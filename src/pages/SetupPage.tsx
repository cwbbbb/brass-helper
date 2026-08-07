import { type ReactNode, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  COLOR_ORDER,
  INITIAL_MONEY,
  PLAYER_COLORS,
  positionBadge,
  type PlayerColor,
} from "@/lib/game";
import { cn } from "@/lib/utils";
import { Shuffle, Play, Users, Coins } from "lucide-react";

const COUNT_OPTIONS = [2, 3, 4];

export default function SetupPage() {
  const players = useGameStore((s) => s.players);
  const setPlayerCount = useGameStore((s) => s.setPlayerCount);
  const shufflePlayers = useGameStore((s) => s.shufflePlayers);
  const swapColor = useGameStore((s) => s.swapColor);
  const setInitialMoney = useGameStore((s) => s.setInitialMoney);
  const setAllInitialMoney = useGameStore((s) => s.setAllInitialMoney);
  const setAllUnlimited = useGameStore((s) => s.setAllUnlimited);
  const startGame = useGameStore((s) => s.startGame);

  const count = players.length;
  // 初始资金预设：所有玩家金钱一致时高亮对应档位
  const allSameMoney = players.every((p) => p.money === players[0]?.money);
  const presetValue = allSameMoney ? players[0]?.money : undefined;
  // 全员无限金钱模式
  const allUnlimited = players.every((p) => p.unlimitedMoney);

  // 不蒜子访客统计：每次进入设置页重新加载脚本并填充
  const bszLoaded = useRef(false);
  useEffect(() => {
    const load = () => {
      const old = document.getElementById("busuanzi-script");
      if (old) old.remove();
      const s = document.createElement("script");
      s.id = "busuanzi-script";
      s.src = "//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js";
      s.async = true;
      document.body.appendChild(s);
    };
    if (bszLoaded.current) {
      load();
    } else {
      bszLoaded.current = true;
      load();
    }
  }, []);

  return (
    <div className="flex h-full flex-col bg-base text-ink">
      {/* 顶栏 */}
      <header className="px-5 pt-6 pb-4 border-b border-line">
        <div className="flex items-center gap-2 text-brass-dim text-[11px] font-display tracking-[0.3em] uppercase">
          <span className="inline-block w-6 h-px bg-brass-dim" />
          Brass · Birmingham
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-wide">
          伯明翰小助手
        </h1>
        <p className="mt-1 text-ink-dim text-sm">
          设置玩家与初始资源，开始一局游戏
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* 玩家人数 */}
        <section>
          <SectionLabel icon={<Users size={14} />}>玩家人数</SectionLabel>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {COUNT_OPTIONS.map((n) => {
              const active = n === count;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPlayerCount(n)}
                  className={cn(
                    "h-16 rounded-xl font-display text-2xl font-semibold transition-all border",
                    active
                      ? "bg-brass text-base border-brass shadow-card"
                      : "bg-elevated text-ink-dim border-line hover:border-brass-dim",
                  )}
                >
                  {n}人
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-ink-mute">
            默认初始资金：2人 ${INITIAL_MONEY[2]} / 3人 ${INITIAL_MONEY[3]} / 4人
            ${INITIAL_MONEY[4]}
          </p>
        </section>

        {/* 初始资金预设 */}
        <section>
          <SectionLabel icon={<Coins size={14} />}>初始资金</SectionLabel>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[17, 30].map((m) => {
              const active = !allUnlimited && presetValue === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAllInitialMoney(m)}
                  className={cn(
                    "h-14 rounded-xl font-display font-semibold transition-all border flex items-center justify-center gap-1",
                    active
                      ? "bg-brass text-base border-brass shadow-card"
                      : "bg-elevated text-ink-dim border-line hover:border-brass-dim",
                  )}
                >
                  <span className="text-brass-dim text-sm">$</span>
                  <span className="text-2xl tnum">{m}</span>
                </button>
              );
            })}
            {/* 无限金钱：仅按回合内花费排顺位，不限制金钱 */}
            <button
              type="button"
              onClick={() => setAllUnlimited()}
              className={cn(
                "h-14 rounded-xl font-display font-semibold transition-all border flex items-center justify-center",
                allUnlimited
                  ? "bg-brass text-base border-brass shadow-card"
                  : "bg-elevated text-ink-dim border-line hover:border-brass-dim",
              )}
              title="无限金钱：仅按回合内花费排顺位"
            >
              <span className="text-2xl tnum">∞</span>
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-mute">
            点击预设一键应用到所有玩家，∞ 表示无限金钱（只算花费排顺位）
          </p>
        </section>

        {/* 玩家配置 */}
        <section>
          <div className="flex items-center justify-between">
            <SectionLabel>玩家与顺位</SectionLabel>
            <button
              type="button"
              onClick={shufflePlayers}
              className="flex items-center gap-1.5 text-sm text-brass border border-brass/30 bg-brass/10 rounded-lg px-3 h-9 font-medium active:bg-brass/20"
            >
              <Shuffle size={14} />
              随机顺位
            </button>
          </div>

          <ul className="mt-3 space-y-2.5">
            {players.map((p, idx) => {
              const cfg = PLAYER_COLORS[p.color];
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 bg-surface border border-line rounded-xl p-3 animate-slide-up"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* 顺位徽章 */}
                  <div className="font-display text-2xl font-bold text-brass w-10 text-center tnum">
                    {positionBadge(idx + 1)}
                  </div>

                  {/* 色块（点击切换颜色） */}
                  <button
                    type="button"
                    onClick={() => swapColor(p.id)}
                    className={cn(
                      "relative h-12 w-12 rounded-lg flex items-center justify-center font-display font-bold text-lg transition-transform active:scale-95",
                      cfg.stripe,
                    )}
                    style={{ color: cfg.text }}
                    aria-label={`切换玩家 ${idx + 1} 颜色`}
                  >
                    {cfg.label}
                  </button>

                  {/* 玩家标签 */}
                  <div className="flex-1">
                    <div className="text-ink text-sm font-semibold">
                      玩家 {idx + 1}
                    </div>
                    <div className="text-ink-mute text-xs">
                      点击色块切换颜色
                    </div>
                  </div>

                  {/* 初始资金 */}
                  <div className="flex items-center bg-base border border-line rounded-lg overflow-hidden">
                    <span className="px-2 text-brass-dim font-display text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={p.money}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setInitialMoney(p.id, Number.isNaN(v) ? 0 : v);
                      }}
                      className="w-14 bg-transparent text-right font-display text-xl font-semibold text-ink outline-none tnum py-2"
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          {/* 颜色图例 */}
          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-ink-mute">
            {COLOR_ORDER.map((c: PlayerColor) => {
              const used = players.some((p) => p.color === c);
              const cfg = PLAYER_COLORS[c];
              return (
                <span
                  key={c}
                  className={cn(
                    "flex items-center gap-1.5 transition-opacity",
                    used ? "opacity-100" : "opacity-40",
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ background: cfg.bg }}
                  />
                  {cfg.label}
                </span>
              );
            })}
          </div>
        </section>
      </main>

      {/* 访客统计 —— 不蒜子，小字不影响使用 */}
      <div className="text-center text-[10px] text-ink-mute py-1">
        已有 <span id="busuanzi_site_uv">…</span> 位访客
      </div>

      {/* 底部操作 */}
      <footer className="border-t border-line bg-surface/80 backdrop-blur px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={startGame}
          className="w-full h-14 rounded-xl bg-brass text-base font-display font-bold text-lg tracking-wide flex items-center justify-center gap-2 active:bg-brass-dim transition-colors shadow-card"
        >
          <Play size={18} strokeWidth={2.5} />
          开始游戏
        </button>
      </footer>
    </div>
  );
}

function SectionLabel({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-ink-dim text-xs font-display tracking-[0.2em] uppercase">
      {icon}
      {children}
    </div>
  );
}
