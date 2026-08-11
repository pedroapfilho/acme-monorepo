import { pixelBasedPreset } from "react-email";

const emailTheme = {
  borderRadius: {
    full: "9999px",
    lg: "10px",
    md: "8px",
    sm: "4px",
    xl: "16px",
  },
  colors: {
    background: "#ffffff",
    backgroundDark: "#0a0a0a",
    border: "#e5e5e5",
    borderDark: "#282828",
    error: "#e7000b",
    primary: "#171717",
    primaryDark: "#0a0a0a",
    secondary: "#f5f5f5",
    secondaryDark: "#e5e5e5",
    success: "#10b981",
    text: "#0a0a0a",
    textDark: "#fafafa",
    textLight: "#737373",
    textMuted: "#a1a1a1",
    warning: "#f59e0b",
  },
  fonts: {
    mono: '"SF Mono", Monaco, Inconsolata, "Fira Code", "Fira Mono", "Roboto Mono", "Courier New", monospace',
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  spacing: {
    "2xl": "48px",
    lg: "24px",
    md: "16px",
    sm: "8px",
    xl: "32px",
    xs: "4px",
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
        "primary-dark": emailTheme.colors.primaryDark,
        "primary-foreground": emailTheme.colors.textDark,
        secondary: emailTheme.colors.secondary,
        "secondary-dark": emailTheme.colors.secondaryDark,
        "secondary-foreground": emailTheme.colors.primary,
      },
      fontFamily: {
        mono: emailTheme.fonts.mono,
        sans: emailTheme.fonts.sans,
      },
    },
  },
};

export { emailTheme, tailwindConfig };
