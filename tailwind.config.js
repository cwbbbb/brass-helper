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
        base: "#0f0f0f",
        surface: "#1a1a1a",
        elevated: "#242424",
        line: "#2e2e2e",
        ink: {
          DEFAULT: "#f5f0e6",
          dim: "#a8a39a",
          mute: "#6b6760",
        },
        brass: {
          DEFAULT: "#c8a464",
          dim: "#8a7448",
          deep: "#5c4a2e",
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
        "inset-line": "inset 0 -1px 0 0 rgba(255,255,255,0.04)",
        card: "0 1px 0 0 rgba(255,255,255,0.03), 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
