import { pixelBasedPreset } from "react-email";

const emailTheme = {
  colors: {
    background: "#ffffff",
    border: "#e5e5e5",
    error: "#e7000b",
    primary: "#171717",
    secondary: "#f5f5f5",
    text: "#0a0a0a",
    textDark: "#fafafa",
    textLight: "#737373",
  },
  fonts: {
    mono: '"SF Mono", Monaco, Inconsolata, "Fira Code", "Fira Mono", "Roboto Mono", "Courier New", monospace',
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        accent: emailTheme.colors.secondary,
        "accent-foreground": emailTheme.colors.primary,
        background: emailTheme.colors.background,
        border: emailTheme.colors.border,
        card: emailTheme.colors.background,
        "card-foreground": emailTheme.colors.text,
        destructive: emailTheme.colors.error,
        "destructive-foreground": emailTheme.colors.textDark,
        foreground: emailTheme.colors.text,
        muted: emailTheme.colors.secondary,
        "muted-foreground": emailTheme.colors.textLight,
        primary: emailTheme.colors.primary,
        "primary-foreground": emailTheme.colors.textDark,
        secondary: emailTheme.colors.secondary,
        "secondary-foreground": emailTheme.colors.primary,
      },
      fontFamily: {
        mono: emailTheme.fonts.mono,
        sans: emailTheme.fonts.sans,
      },
    },
  },
};

export { tailwindConfig };
