// Brand colors come from White Rabbit cookbook (black + dark cards + WR yellow).
// Aligned with the cookbook accent so tools.whiterabbit.cz reads as the same
// brand as the agency site and client decks.

export const colors = {
  // Backgrounds
  bg: "#000000",
  bgCard: "#1A1A1A",
  bgDarker: "#0A0A0A",

  // Text
  white: "#FFFFFF",
  gray: "#888888",

  // WR yellow accent (text on accent fills uses the dark complement)
  accent: "#FFC107",
  accentDark: "#784213",

  // States
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
} as const

// Per cookbook: Century Gothic primary, with safe system fallbacks across
// Mac/Win/Linux. No webfont load — these are all locally available.
export const fonts = {
  sans: '"Century Gothic", "Avenir Next", "Avenir", "URW Gothic", "Futura", system-ui, sans-serif',
} as const

export const fontSizes = {
  hero: "clamp(2.5rem, 5vw, 4rem)",
  h1: "clamp(2rem, 4vw, 3rem)",
  h2: "1.5rem",
  h3: "1.125rem",
  body: "1rem",
  small: "0.875rem",
  caps: "0.75rem",
  footer: "0.8125rem",
} as const

export const fontWeights = {
  regular: 400,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
} as const

export const spacing = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
  xxl: "5rem",
} as const
