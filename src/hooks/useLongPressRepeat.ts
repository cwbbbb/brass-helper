import { useCallback, useEffect, useRef } from "react";

/**
 * 长按连续触发 hook
 * - 按下后等待 delay ms，然后每 interval ms 触发一次 onRepeat
 * - 快速点按（未到 delay）不会触发 onRepeat，由调用方自行用 onClick 处理
 * - 通过 didRepeatRef 标记是否发生过连续触发，调用方可在 click 时据此抑制重复
 */
export function useLongPressRepeat(
  onRepeat: () => void,
  delay = 380,
  interval = 70,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didRepeatRef = useRef(false);
  const cbRef = useRef(onRepeat);

  useEffect(() => {
    cbRef.current = onRepeat;
  }, [onRepeat]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    didRepeatRef.current = false;
    stop();
    timerRef.current = setTimeout(() => {
      didRepeatRef.current = true;
      cbRef.current();
      intervalRef.current = setInterval(() => cbRef.current(), interval);
    }, delay);
  }, [delay, interval, stop]);

  // 卸载时清理
  useEffect(() => () => stop(), [stop]);

  return { start, stop, didRepeatRef };
}
