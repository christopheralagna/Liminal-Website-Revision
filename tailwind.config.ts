import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#141312",
          900: "#1c1a18",
          800: "#292523",
          700: "#383431",
          600: "#4e4945",
        },
        terracotta: {
          600: "#864d36",
          500: "#9b5d43",
          400: "#b37a5c",
          300: "#ca977e",
          200: "#e0b6a2",
        },
        peach: {
          300: "#e39c7a",
          200: "#f0b89e",
          100: "#f8d7c8",
        },
        olive: {
          900: "#2a261a",
          800: "#3d3725",
          700: "#4e4732",
          600: "#60583f",
        },
        cream: {
          50: "#faf6f0",
          100: "#f4ede4",
          200: "#e8e0d5",
          300: "#d5c9bc",
          400: "#b8aba0",
        },
        sage: {
          200: "#e2f2d5",
          300: "#d4eac2",
          400: "#b3cca0",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      letterSpacing: {
        widest: ".18em",
      },
    },
  },
  plugins: [],
};

export default config;

