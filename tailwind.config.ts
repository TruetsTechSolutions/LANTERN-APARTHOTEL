import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          50: "#f8f9fa",
          100: "#f1f3f5",
          200: "#e9ecef",
          300: "#dee2e6",
          400: "#ced4da",
          500: "#adb5bd",
          600: "#6c757d",
          700: "#495057",
          800: "#343a40",
          900: "#212529",
          950: "#0f172a",
        },
        gold: {
          50: "#fdfbf7",
          100: "#faf4e8",
          200: "#f4e4c2",
          300: "#ecd197",
          400: "#e2b860",
          500: "#c99a38",
          600: "#aa7c29",
          700: "#865e23",
          800: "#6e4b21",
          900: "#5c3e1e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
