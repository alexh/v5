import type { Config } from "tailwindcss";
import _plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        receipt: ['"receipt-narrow"', "sans-serif"],
        forma: ['"forma-djr-display"', "sans-serif"],
      },
      colors: {
        theme: {
          primary: "var(--theme-primary)",
          secondary: "var(--theme-secondary)",
          text: "var(--theme-text)",
          background: "var(--theme-background)",
        },
      },
      animation: {
        shimmer: "shimmer 2s ease-in-out infinite",
        "shimmer-sweep": "shimmer-sweep 1.5s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%) rotate(12deg)" },
          "100%": { transform: "translateX(300%) rotate(12deg)" },
        },
        "shimmer-sweep": {
          "0%": { transform: "translateX(-150%) skewX(12deg)" },
          "50%": { transform: "translateX(-50%) skewX(12deg)" },
          "100%": { transform: "translateX(150%) skewX(12deg)" },
        },
      },
    },
  },
};
export default config;
