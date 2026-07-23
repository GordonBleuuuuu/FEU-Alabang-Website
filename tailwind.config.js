/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./data/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FEU Alabang SCC brand palette
        feu: {
          green: "#004B23",   // Deep FEU green
          teal: "#0F5257",    // Secondary teal-green
          leaf: "#3A7D44",    // Lighter leaf accent
          moss: "#0A3D1F",    // Darkest green for depth
        },
        gold: {
          DEFAULT: "#FFB703",
          soft: "#FFD166",
          deep: "#D4AF37",
        },
        ink: {
          DEFAULT: "#0F172A", // Slate dark
          soft: "#1E293B",
        },
        cloud: "#F8FAFC",     // Clean light slate
      },
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
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
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
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
};
