import { create } from "zustand";

export type Theme = "dark" | "light";

const STORAGE_KEY = "brass-helper-theme";

// 默认深色（保持原有视觉）
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "dark";
}

// 把主题写到 <html> class 上，触发 CSS 变量切换
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
    set({ theme: next });
  },
}));

// 启动时立即应用主题，避免渲染后闪烁
export function initTheme() {
  applyTheme(useThemeStore.getState().theme);
}
