export const terminalTheme = {
  colors: {
    background: "#1a1b26",
    card: "#24283b",
    border: "#414868",
    primary: "#7aa2f7",
    secondary: "#a9b1d6",
    accent: "#bb9af7",
    income: "#9ece6a",
    expense: "#f7768e",
    muted: "#565f89",
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
    thin: "1px solid #414868",
    radius: 4,
  },
  ascii: {
    tl: "┌─",
    tr: "─┐",
    bl: "└─",
    br: "─┘",
    h: "─",
    v: "│",
    section: "──",
    fill: "█",
    empty: "░",
  },
};

export type TerminalTheme = typeof terminalTheme;