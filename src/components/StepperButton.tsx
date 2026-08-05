import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLongPressRepeat } from "@/hooks/useLongPressRepeat";

interface StepperButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: "add" | "sub" | "neutral" | "income";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  /** 开启长按连续触发（按住后重复调用 onClick） */
  repeat?: boolean;
}

/**
 * 通用增减按钮：大触控目标、明确的加减语义色
 * 开启 repeat 后：快速点按仍为单次 onClick；长按 380ms 后连续触发
 */
export default function StepperButton({
  onClick,
  children,
  variant = "neutral",
  disabled,
  className,
  ariaLabel,
  repeat,
}: StepperButtonProps) {
  const base =
    "flex items-center justify-center rounded-lg font-display font-semibold tnum transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none";
  const variants: Record<string, string> = {
    add: "bg-brass/15 text-brass border border-brass/30 active:bg-brass/25",
    sub: "bg-elevated text-ink-dim border border-line active:bg-line",
    neutral: "bg-elevated text-ink border border-line active:bg-line",
    income:
      "bg-player-purple/15 text-player-purple-light border border-player-purple/30 active:bg-player-purple/25",
  };

  const longPress = useLongPressRepeat(onClick);

  const handleClick = () => {
    // 长按已连续触发，抑制随后的 click，避免多算一次
    if (repeat && longPress.didRepeatRef.current) {
      longPress.didRepeatRef.current = false;
      return;
    }
    onClick();
  };

  const pointerHandlers = repeat
    ? {
        onPointerDown: (e: React.PointerEvent) => {
          if (disabled) return;
          // 阻止浏览器触摸滚动/长按菜单，确保连续触发稳定
          e.preventDefault();
          longPress.start();
        },
        onPointerUp: longPress.stop,
        onPointerLeave: longPress.stop,
        onPointerCancel: longPress.stop,
      }
    : {};

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={repeat ? { touchAction: "none" } : undefined}
      className={cn(
        base,
        variants[variant],
        repeat && "active:scale-100",
        className,
      )}
      {...pointerHandlers}
    >
      {children}
    </button>
  );
}
