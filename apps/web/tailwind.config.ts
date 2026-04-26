import type { Config } from "tailwindcss"

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        card: "#1A1A1A",
        darker: "#0A0A0A",
        accent: "#00E5FF",
        "accent-dark": "#0F3D45",
      },
      fontFamily: {
        sans: ['"Nunito"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
      },
      letterSpacing: {
        caps: "0.1em",
      },
    },
  },
  plugins: [],
} satisfies Config
