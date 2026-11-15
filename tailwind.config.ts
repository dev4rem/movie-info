import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cinema: {
          950: "#07090e",
          900: "#0d111a",
          850: "#131926",
          800: "#1a2234",
          700: "#27344e",
          600: "#3b4d70",
          500: "#60759f",
        },
        brand: {
          DEFAULT: "#e50914",
          hover: "#f40612",
          subtle: "rgba(229, 9, 20, 0.15)",
        },
        gold: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
export default config;
