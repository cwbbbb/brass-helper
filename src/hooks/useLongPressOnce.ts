import { useCallback, useEffect, useRef } from "react";

/**
 * 长按单次触发 hook（不连续重复）
 * - 按下后等待 delay ms，触发一次 onLongPress
 * - 不会重复触发；松手或离开时清理
 * - 通过 didFireRef 标记是否已触发，调用方可在 click 时据此抑制重复
 */
export function useLongPressOnce(onLongPress: () => void, delay = 480) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didFireRef = useRef(false);
  const cbRef = useRef(onLongPress);

  useEffect(() => {
    cbRef.current = onLongPress;
  }, [onLongPress]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    didFireRef.current = false;
    stop();
    timerRef.current = setTimeout(() => {
      didFireRef.current = true;
      cbRef.current();
    }, delay);
  }, [delay, stop]);

  // 卸载时清理
  useEffect(() => () => stop(), [stop]);

  return { start, stop, didFireRef };
}
