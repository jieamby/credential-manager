import type { Config } from "tailwindcss";

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1c2430", soft: "#5b6572", deep: "#141b26" },
        paper: "#eceff2",
        surface: "#f8f9fa",
        line: "#d3d8de",
        brass: { DEFAULT: "#8a6218", dark: "#6f4f12", tint: "#f1e6cc" },
        danger: { DEFAULT: "#a63d40", dark: "#8a2f32" },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
} satisfies Config;
