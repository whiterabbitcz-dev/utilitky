// Brand colors come from White Rabbit cookbook (black + dark cards).
// Accent for tools is electric cyan (different from WR yellow on the agency site
// so the agency brand stays distinct from the product sub-brand).

export const colors = {
  // Backgrounds
  bg: "#000000",
  bgCard: "#1A1A1A",
  bgDarker: "#0A0A0A",

  // Text
  white: "#FFFFFF",
  gray: "#888888",

  // Tools accent
  accent: "#00E5FF",
  accentDark: "#0F3D45",

  // States
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
} as const

export const fonts = {
  sans: '"Nunito", system-ui, -apple-system, sans-serif',
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
