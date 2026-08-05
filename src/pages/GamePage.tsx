import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import PlayerCard from "@/components/PlayerCard";
import { cn } from "@/lib/utils";
import { Undo2, Check, Home } from "lucide-react";

export default function GamePage() {
  const players = useGameStore((s) => s.players);
  const round = useGameStore((s) => s.round);
  const history = useGameStore((s) => s.history);
  const endRound = useGameStore((s) => s.endRound);
  const rollback = useGameStore((s) => s.rollback);
  const backToSetup = useGameStore((s) => s.backToSetup);

  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const canRollback = history.length > 0;

  return (
    <div className="flex h-full flex-col bg-base text-ink">
      {/* 顶栏 */}
      <header className="px-4 py-2.5 border-b border-line bg-surface/60 backdrop-blur">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-dim active:bg-elevated"
            aria-label="菜单"
          >
            <Home size={18} />
          </button>

          <div className="text-center">
            <div className="text-[10px] text-ink-mute font-display tracking-[0.3em] uppercase">
              Round
            </div>
            <div className="font-display text-xl font-bold leading-none tnum">
              {round}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmEnd(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-brass active:bg-brass/10"
            aria-label="结束回合"
          >
            <Check size={18} />
          </button>
        </div>
        {/* 操作提示 */}
        <div className="mt-1 text-center text-[10px] text-ink-mute">
          长按「贷」可取消贷款 · 点击玩家金钱可修改
        </div>
      </header>

      {/* 玩家卡片列表 */}
      <main className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-2.5">
          {players.map((p, idx) => (
            <PlayerCard
              key={p.id}
              player={p}
              position={idx}
              isNext={idx === 0}
              index={idx}
            />
          ))}
        </div>
      </main>

      {/* 底部操作栏 */}
      <footer className="border-t border-line bg-surface/80 backdrop-blur px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={rollback}
            disabled={!canRollback}
            className={cn(
              "col-span-2 h-14 rounded-xl font-display font-semibold text-base flex items-center justify-center gap-1.5 transition-colors border",
              canRollback
                ? "bg-elevated text-ink border-line active:bg-line"
                : "bg-elevated/50 text-ink-mute border-line/50 cursor-not-allowed",
            )}
          >
            <Undo2 size={16} />
            回滚
          </button>
          <button
            type="button"
            onClick={() => setShowConfirmEnd(true)}
            className="col-span-3 h-14 rounded-xl bg-brass text-base font-display font-bold text-lg flex items-center justify-center gap-2 active:bg-brass-dim transition-colors shadow-card"
          >
            <Check size={18} strokeWidth={2.5} />
            结束回合
          </button>
        </div>
        {!canRollback && (
          <p className="mt-1.5 text-center text-[10px] text-ink-mute">
            第 1 回合，无可回滚历史
          </p>
        )}
      </footer>

      {/* 结束回合确认弹窗 */}
      {showConfirmEnd && (
        <ConfirmDialog
          title="结束回合？"
          message="将按本回合花费升序重排顺位，并按收入轨发放收入。"
          confirmText="结束回合"
          confirmVariant="primary"
          onConfirm={() => {
            endRound();
            setShowConfirmEnd(false);
          }}
          onCancel={() => setShowConfirmEnd(false)}
        />
      )}

      {/* 菜单弹窗 */}
      {showMenu && (
        <ConfirmDialog
          title="返回设置页？"
          message="当前游戏进度将被清空，无法恢复。"
          confirmText="返回设置"
          confirmVariant="danger"
          onConfirm={() => {
            backToSetup();
            setShowMenu(false);
          }}
          onCancel={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

interface ConfirmDialogProps {
  title: string;
  message: React.ReactNode;
  confirmText: string;
  confirmVariant: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  message,
  confirmText,
  confirmVariant,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-surface border border-line rounded-2xl p-5 shadow-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
        <div className="mt-2 text-sm text-ink-dim leading-relaxed">{message}</div>
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl bg-elevated text-ink border border-line font-medium active:bg-line"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "flex-1 h-12 rounded-xl font-display font-bold transition-colors",
              confirmVariant === "primary"
                ? "bg-brass text-base active:bg-brass-dim"
                : "bg-player-red text-white active:bg-player-red/80",
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
