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
    },
  },
};
export default config;
