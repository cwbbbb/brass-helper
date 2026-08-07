/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 主题色由 CSS 变量驱动，在 index.css 中按 .dark 切换深浅
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        line: "var(--color-line)",
        app: "var(--color-app)",
        ink: {
          DEFAULT: "var(--color-ink)",
          dim: "var(--color-ink-dim)",
          mute: "var(--color-ink-mute)",
        },
        brass: {
          DEFAULT: "var(--color-brass)",
          dim: "var(--color-brass-dim)",
          deep: "var(--color-brass-deep)",
        },
        player: {
          red: "#c83232",
          "red-light": "#d94545",
          yellow: "#e0b020",
          "yellow-light": "#f0c040",
          purple: "#7b3fa0",
          "purple-light": "#9050c0",
          white: "#e8e8e8",
        },
      },
      fontFamily: {
        display: ['"Oswald"', '"Manrope"', "sans-serif"],
        sans: ['"Manrope"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        "inset-line": "inset 0 -1px 0 0 var(--shadow-inset-top)",
        card: "0 1px 0 0 var(--shadow-inset-top), 0 8px 24px -12px var(--shadow-card)",
        frame: "0 0 60px var(--shadow-card)",
      },
    },
  },
  plugins: [],
};
