import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mercadito palette — Diego can extend freely (UI is his).
        mercado: { ink: "#0b0b0f", paper: "#f7f3e9", accent: "#ff5d3b", gold: "#ffce4f" },
      },
    },
  },
  plugins: [],
};
export default config;
