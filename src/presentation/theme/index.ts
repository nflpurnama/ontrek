import { terminalTheme } from "./terminal";

export const lightTheme = {
  colors: {
    background: "#f5f5f5",
    card: "#ffffff",
    border: "#e0e0e0",
    primary: "#1976d2",
    secondary: "#424242",
    accent: "#7c4dff",
    income: "#2e7d32",
    expense: "#c62828",
    muted: "#9e9e9e",
    overlay: "rgba(0,0,0,0.4)",
    shadow: "#000000",
  },
  fonts: {
    mono: "JetBrains Mono",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  border: {
    thin: "1px solid #e0e0e0",
    radius: 4,
  },
};

export const darkTheme = {
  colors: {
    background: "#000000",
    card: "#000000",
    border: "#101010",
    primary: "#90caf9",
    secondary: "#ddd",
    accent: "#ce93d8",
    income: "#a5d6a7",
    expense: "#ef9a9a",
    muted: "#999",
    overlay: "rgba(0,0,0,0.6)",
    shadow: "#000000",
  },
  fonts: {
    mono: "JetBrains Mono",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  border: {
    thin: "1px solid #333333",
    radius: 4,
  },
};

export const themes = {
  terminal: terminalTheme,
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes[ThemeName] & {
  ascii?: {
    tl: string;
    tr: string;
    bl: string;
    br: string;
    h: string;
    v: string;
    section: string;
    fill: string;
    empty: string;
  };
};

export const themeMetadata: { name: ThemeName; label: string; description: string }[] = [
  { name: "terminal", label: "Terminal", description: "Tokyo Night inspired terminal aesthetic" },
  { name: "light", label: "Light", description: "Clean and minimal light theme" },
  { name: "dark", label: "Dark", description: "True dark theme for OLED displays" },
];
