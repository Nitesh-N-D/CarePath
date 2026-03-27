/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F766E",
        primaryDark: "#065F46",
        accent: "#06B6D4",
        background: "#F8FAFC",
        backgroundDark: "#0B1220",
        card: "#FFFFFF",
        cardDark: "#111827",
        borderLight: "#E5E7EB",
        borderDark: "rgba(255,255,255,0.08)",
        textPrimary: "#0F172A",
        textDark: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        premium: "0 24px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(6,182,212,0.16), transparent 22%), linear-gradient(180deg, rgba(15,118,110,0.06), transparent 55%)",
      },
    },
  },
  plugins: [],
};
