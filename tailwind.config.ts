import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./data/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Required FEUASCC design tokens. Nested keys generate classes such as
        // bg-feu-green, text-feu-teal, and border-gold-default.
        feu: {
          green: "#004B23",
          teal: "#0F5257",
          moss: "#0A3D1F",
        },
        gold: {
          DEFAULT: "#FFB703",
          default: "#FFB703",
          deep: "#D4AF37",
          soft: "#FFD166",
        },
        ink: {
          DEFAULT: "#0F172A",
          soft: "#1E293B",
        },
        cloud: "#F8FAFC",
      },
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 75, 35, 0.18)",
        gold: "0 10px 30px -8px rgba(255, 183, 3, 0.45)",
        card: "0 20px 45px -20px rgba(15, 23, 42, 0.35)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "radial-gold":
          "radial-gradient(600px circle at 50% 0%, rgba(255,183,3,0.15), transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%": { transform: "translateY(-10px) rotate(1deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
