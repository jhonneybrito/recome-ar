import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102D27",
        forest: "#174C3F",
        sage: "#86AD9D",
        cream: "#F4F1E9",
        peach: "#FF7658",
        mist: "#DFECE6",
        light: "#DDF36A",
        paper: "#FBFAF6"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(25, 66, 51, 0.10)",
      },
      fontFamily: {
        sans: ["Manrope", "Avenir Next", "Avenir", "Segoe UI", "sans-serif"],
        display: ["Newsreader", "Iowan Old Style", "Baskerville", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
