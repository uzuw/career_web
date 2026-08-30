import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6366f1",
          deep: "#4f46e5",
        },
        ink: "#0f1728",
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
      },
      boxShadow: {
        soft: "0 10px 30px -18px rgba(15,23,40,0.25)",
        brand: "0 14px 30px -14px rgba(79,70,229,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
