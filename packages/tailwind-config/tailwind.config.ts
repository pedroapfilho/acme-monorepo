import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [`src/**/*.{js,ts,jsx,tsx}`, "../../packages/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {},
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "blink-caret": {
          "50%": { background: "transparent" },
        },
        "pulse-border": {
          "50%": { borderColor: "var(--segment-color)" },
        },
        shake: {
          "25%": { transform: "translateX(4px)" },
          "75%": { transform: "translateX(-4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blink-caret": "blink-caret 1.2s step-end infinite",
        "pulse-border": "pulse-border 1s ease-in-out 0s infinite",
        shake: "shake 0.15s ease-in-out 0s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
