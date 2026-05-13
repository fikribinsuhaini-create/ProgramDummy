import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFBF2",
          100: "#FFF6DE",
          200: "#FFECC0"
        },
        emerald: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B"
        },
        gold: {
          50: "#FFF8E7",
          100: "#FFEFC7",
          200: "#FFE29A",
          300: "#FFD166",
          400: "#FFC24A",
          500: "#F6B73C",
          600: "#D9921F"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.10)"
      }
    }
  },
  plugins: []
} satisfies Config;

