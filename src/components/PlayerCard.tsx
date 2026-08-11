import { useState } from "react";
import { createPortal } from "react-dom";
import { type Player, PLAYER_COLORS, positionBadge, trackToIncome } from "@/lib/game";
import { useThemeStore } from "@/store/themeStore";
import { useGameStore } from "@/store/gameStore";
import { useLongPressRepeat } from "@/hooks/useLongPressRepeat";
import { useLongPressOnce } from "@/hooks/useLongPressOnce";
import { cn } from "@/lib/utils";
import StepperButton from "./StepperButton";

interface PlayerCardProps {
  player: Player;
  position: number; // 0-based
  isNext: boolean; // 是否为下一动作玩家（顺位第 1）
  index: number; // 用于入场动画延迟
}

export default function PlayerCard({
  player,
  position,
  isNext,
  index,
}: PlayerCardProps) {
  const cfg = PLAYER_COLORS[player.color];
  const adjustSpent = useGameStore((s) => s.adjustSpent);
  const adjustIncome = useGameStore((s) => s.adjustIncome);
  const adjustMoney = useGameStore((s) => s.adjustMoney);
  const takeLoan = useGameStore((s) => s.takeLoan);
  const repayLoan = useGameStore((s) => s.repayLoan);

  const [showMoneyDialog, setShowMoneyDialog] = useState(false);

  // 贷款按钮：单击=贷款，长按=撤回贷款（仅触发一次，不连续）
  const loanLongPress = useLongPressOnce(() => repayLoan(player.id));

  // 浅色主题下花费数字不发光（浅底发光会模糊）
  const theme = useThemeStore((s) => s.theme);

  // 收入值由轨位推导（非 1:1）；轨道条按 0-99 位置填充
  const income = trackToIncome(player.incomeTrack);
  const trackPct = (player.incomeTrack / 99) * 100;

  return (
    <article
      className="relative bg-surface border border-line rounded-xl overflow-hidden shadow-card transition-colors animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* 顶部色条 */}
      <div className={cn("h-1 w-full", cfg.stripe)} />

      <div className="flex items-stretch">
        {/* 左侧色块 */}
        <div
          className={cn(
            "w-12 flex flex-col items-center justify-center py-2",
            cfg.stripe,
          )}
          style={{ color: cfg.text }}
        >
          <div className="font-display text-2xl font-bold leading-none tnum">
            {position + 1}
          </div>
          <div className="text-[10px] font-display tracking-wider opacity-80 mt-0.5">
            {positionBadge(position + 1).slice(0, 2)}
          </div>
        </div>

        {/* 右侧主体 */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* 头部：玩家色 + 收入 + 贷款 + 金钱 同一行 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-display text-base font-semibold truncate">
                {cfg.label}
              </span>
              {isNext && (
                <span className="text-[10px] text-brass font-display tracking-wider bg-brass/10 border border-brass/30 rounded px-1.5 py-0.5 shrink-0">
                  NEXT
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* 收入值（由轨位推导，非 1:1） */}
              <div
                className="flex items-baseline gap-0.5 px-1"
                title={`收入 ${income}（轨位 ${player.incomeTrack}）`}
              >
                <span className="text-[10px] text-ink-mute font-display tracking-wider mr-0.5">
                  收入
                </span>
                <span
                  className={cn(
                    "font-display text-2xl font-bold tnum leading-none",
                    income < 0
                      ? "text-player-red-light"
                      : "text-player-yellow-light",
                  )}
                >
                  {income > 0 ? "+" : ""}
                  {income}
                </span>
              </div>
              {/* 贷款按钮：单击贷款（收入−3 金钱+30），长按撤回（收入+3 金钱−30）；无限金钱模式隐藏 */}
              {!player.unlimitedMoney && (
                <button
                  type="button"
                  onClick={() => {
                    if (loanLongPress.didFireRef.current) {
                      loanLongPress.didFireRef.current = false;
                      return;
                    }
                    takeLoan(player.id);
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    loanLongPress.start();
                  }}
                  onPointerUp={loanLongPress.stop}
                  onPointerLeave={loanLongPress.stop}
                  onPointerCancel={loanLongPress.stop}
                  style={{ touchAction: "none" }}
                  className="h-8 w-8 rounded-md bg-player-red/15 text-player-red-light border border-player-red/30 font-display font-bold text-sm active:bg-player-red/25 active:scale-95 transition-all"
                  aria-label="贷款，单击贷款，长按撤回"
                  title="单击贷款 +$30（收入−3），长按撤回 −$30"
                >
                  贷
                </button>
              )}
              {/* 金钱（点击打开全屏加减弹窗）；无限金钱模式显示 ∞ 不可点击 */}
              <button
                type="button"
                onClick={() => {
                  if (!player.unlimitedMoney) setShowMoneyDialog(true);
                }}
                disabled={player.unlimitedMoney}
                className="flex items-baseline gap-0.5 rounded-md px-1.5 py-1 active:bg-elevated transition-colors disabled:active:bg-transparent"
                aria-label={player.unlimitedMoney ? "无限金钱模式" : "点击调整金钱"}
                title={player.unlimitedMoney ? "无限金钱模式" : "点击调整金钱（售卖铁煤等直接获得金钱）"}
              >
                <span className="text-brass-dim font-display text-sm">$</span>
                <span className="font-display text-2xl font-bold text-ink tnum leading-none">
                  {player.unlimitedMoney ? "∞" : player.money}
                </span>
              </button>
            </div>
          </div>

          {/* 花费英雄行 —— 回合内核心信息，超大超亮 */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-ink-mute font-display tracking-wider">
                本回合花费
              </span>
              <span
                className="font-display font-bold tnum leading-none"
                style={{
                  fontSize: "2.75rem",
                  color: player.spentThisRound > 0 ? "#ff3b30" : "#5a5650",
                  textShadow:
                    player.spentThisRound > 0 && theme === "dark"
                      ? "0 0 14px rgba(255,59,48,0.65)"
                      : "none",
                }}
              >
                ${player.spentThisRound}
              </span>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-1.5">
              <StepperButton
                variant="sub"
                onClick={() => adjustSpent(player.id, -5)}
                disabled={player.spentThisRound <= 0}
                ariaLabel="减少5花费"
                className="h-9 text-sm"
              >
                −5
              </StepperButton>
              <StepperButton
                variant="sub"
                onClick={() => adjustSpent(player.id, -1)}
                disabled={player.spentThisRound <= 0}
                ariaLabel="减少1花费"
                className="h-9 text-sm"
              >
                −1
              </StepperButton>
              <StepperButton
                variant="add"
                onClick={() => adjustSpent(player.id, 1)}
                disabled={!player.unlimitedMoney && player.money <= 0}
                ariaLabel="增加1花费"
                className="h-9 text-sm"
              >
                +1
              </StepperButton>
              <StepperButton
                variant="add"
                onClick={() => adjustSpent(player.id, 5)}
                disabled={!player.unlimitedMoney && player.money <= 0}
                ariaLabel="增加5花费"
                className="h-9 text-sm"
              >
                +5
              </StepperButton>
            </div>
          </div>

          {/* 收入轨行：仅进度条 + 步进（收入值已移至头部） */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base text-ink-dim font-display tracking-wider w-12 shrink-0 tnum">
              轨{player.incomeTrack}
            </span>
            {/* 轨道可视化：0-99 位置，黄色填充 */}
            <div className="flex-1 h-2 bg-base rounded-full overflow-hidden border border-line relative">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-player-yellow to-player-yellow-light transition-all duration-200"
                style={{ width: `${trackPct}%` }}
              />
            </div>
            <div className="flex gap-1.5 items-center">
              <StepperButton
                variant="sub"
                onClick={() => adjustIncome(player.id, -1)}
                repeat
                disabled={player.incomeTrack <= 0}
                ariaLabel="收入轨后退一格（可长按）"
                className="h-9 w-9 text-base"
              >
                −
              </StepperButton>
              <StepperButton
                variant="income"
                onClick={() => adjustIncome(player.id, 1)}
                repeat
                disabled={player.incomeTrack >= 99}
                ariaLabel="收入轨前进一格（可长按）"
                className="h-9 w-9 text-base"
              >
                +
              </StepperButton>
            </div>
          </div>
        </div>
      </div>

      {/* 金钱调整弹窗 —— 用 Portal 渲染到 body，避免卡片 transform 破坏 fixed 定位 */}
      {showMoneyDialog &&
        createPortal(
          <MoneyDialog
            player={player}
            onClose={() => setShowMoneyDialog(false)}
            onAdjust={(delta) => adjustMoney(player.id, delta)}
          />,
          document.body,
        )}
    </article>
  );
}

interface MoneyDialogProps {
  player: Player;
  onClose: () => void;
  onAdjust: (delta: number) => void;
}

function MoneyDialog({ player, onClose, onAdjust }: MoneyDialogProps) {
  const cfg = PLAYER_COLORS[player.color];
  /*
    关闭策略：底层 backdrop 是全屏 onClick={onClose} 关闭层；
    上层 content 用 pointer-events-none 让空白处点击穿透到 backdrop，
    仅 header 与交互簇开启 pointer-events-auto 捕获自身点击（不关闭）。
    这样点空白必关、点按钮必不关，且不依赖事件冒泡。
  */
  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* 关闭层（全屏背景，点击即关） */}
      <div
        className="absolute inset-0 bg-base animate-slide-up"
        onClick={onClose}
      />

      {/* 内容层：穿透点击，让空白处落到关闭层 */}
      <div className="relative flex flex-col h-full pointer-events-none">
        {/* 顶栏 */}
        <header
          className={cn(
            "flex items-center justify-between px-5 py-4 shrink-0 pointer-events-auto",
            cfg.stripe,
          )}
          style={{ color: cfg.text }}
        >
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold">
              {cfg.label}
            </span>
            <span className="text-xs font-display tracking-wider opacity-80">
              玩家 · 金钱
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center active:bg-black/20"
            aria-label="关闭"
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
        </header>

        {/* 交互簇：捕获自身点击，不关闭 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="flex flex-col items-center w-full max-w-sm pointer-events-auto">
            <div className="text-[11px] text-ink-mute font-display tracking-[0.3em] uppercase">
              Current Money
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-brass-dim font-display text-3xl">$</span>
              <span
                className="font-display font-bold text-ink tnum leading-none"
                style={{ fontSize: "7rem" }}
              >
                {player.money}
              </span>
            </div>

            {/* 快捷金额按钮 */}
            <div className="mt-10 w-full grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => onAdjust(-10)}
                disabled={player.money < 10}
                className="h-16 rounded-xl bg-elevated text-ink-dim border border-line font-display font-bold text-xl active:bg-line disabled:opacity-30"
              >
                −10
              </button>
              <button
                type="button"
                onClick={() => onAdjust(-1)}
                disabled={player.money < 1}
                className="h-16 rounded-xl bg-elevated text-ink-dim border border-line font-display font-bold text-xl active:bg-line disabled:opacity-30"
              >
                −1
              </button>
              <button
                type="button"
                onClick={() => onAdjust(1)}
                className="h-16 rounded-xl bg-brass/15 text-brass border border-brass/30 font-display font-bold text-xl active:bg-brass/25"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => onAdjust(10)}
                className="h-16 rounded-xl bg-brass/15 text-brass border border-brass/30 font-display font-bold text-xl active:bg-brass/25"
              >
                +10
              </button>
            </div>

            {/* 大额快捷 */}
            <div className="mt-3 w-full grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => onAdjust(-5)}
                disabled={player.money < 5}
                className="h-16 rounded-xl bg-elevated text-ink-dim border border-line font-display font-bold text-xl active:bg-line disabled:opacity-30"
              >
                −5
              </button>
              <button
                type="button"
                onClick={() => onAdjust(5)}
                className="h-16 rounded-xl bg-brass/15 text-brass border border-brass/30 font-display font-bold text-xl active:bg-brass/25"
              >
                +5
              </button>
              <button
                type="button"
                onClick={() => onAdjust(20)}
                className="h-16 rounded-xl bg-brass/15 text-brass border border-brass/30 font-display font-bold text-xl active:bg-brass/25"
              >
                +20
              </button>
              <button
                type="button"
                onClick={() => onAdjust(30)}
                className="h-16 rounded-xl bg-brass/15 text-brass border border-brass/30 font-display font-bold text-xl active:bg-brass/25"
              >
                +30
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-ink-mute">
              售卖铁煤等直接获得金钱在此调整 · 点击空白处关闭
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
