import { motion } from "framer-motion";

import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`group inline-flex items-center gap-3 rounded-full border border-borderLight bg-card/90 px-2 py-2 text-textPrimary shadow-sm transition-all duration-300 hover:shadow-md dark:border-borderDark dark:bg-cardDark/90 dark:text-textDark ${className}`}
    >
      <div className="relative flex h-9 w-[72px] items-center rounded-full bg-[linear-gradient(135deg,rgba(15,118,110,0.14),rgba(6,182,212,0.18))] px-1 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(8,145,178,0.28))]">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] dark:bg-slate-950"
          animate={{ x: isDark ? 36 : 0 }}
        />
        <span className={`relative z-10 flex w-1/2 justify-center text-sm transition-colors duration-300 ${isDark ? "text-slate-400" : "text-amber-500"}`}>
          🌞
        </span>
        <span className={`relative z-10 flex w-1/2 justify-center text-sm transition-colors duration-300 ${isDark ? "text-cyan-300" : "text-slate-400"}`}>
          🌙
        </span>
      </div>
      <span className="pr-2 text-sm font-medium">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

export default ThemeToggle;
