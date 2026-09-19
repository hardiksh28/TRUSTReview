import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        verified: {
          DEFAULT: "#0B6B3A",
          50: "#E8F3EC",
          100: "#CFE7D6",
          600: "#0B6B3A",
          700: "#095A30",
        },
        reject: {
          DEFAULT: "#C0392B",
          50: "#FBEAE8",
          100: "#F3CDC8",
          600: "#C0392B",
          700: "#9E2E22",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
