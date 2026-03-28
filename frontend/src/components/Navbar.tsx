import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./ui/Button";

const marketingLinks = [
  { to: "/#features", label: "Features" },
  { to: "/#insights", label: "Insights" },
  { to: "/#ai-showcase", label: "AI" },
  { to: "/#doctors", label: "Doctors" },
  { to: "/#workflow", label: "Workflow" },
];

function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dashboardPath = user?.role === "admin" ? "/admin" : user?.role === "doctor" ? "/doctor" : "/dashboard";

  return (
    <header className="topbar-shell">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white shadow-soft">
            CP
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-textPrimary dark:text-textDark">CarePath</div>
            <div className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">A calmer way to manage modern health data</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {marketingLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className="rounded-xl px-4 py-2 text-sm text-slate-600 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-900/5 hover:text-textPrimary dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-textDark"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-borderLight bg-card/80 px-3 py-2 text-sm text-textPrimary transition-all duration-300 hover:scale-[1.02] hover:bg-card dark:border-borderDark dark:bg-cardDark/70 dark:text-textDark"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          {user ? (
            <Button to={dashboardPath} className="rounded-xl">
              Open Dashboard
            </Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" className="rounded-xl">
                Sign in
              </Button>
              <Button to="/register" className="rounded-xl">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="shrink-0 rounded-xl border border-borderLight bg-card/80 px-3 py-2 text-sm text-textPrimary dark:border-borderDark dark:bg-cardDark/70 dark:text-textDark lg:hidden"
        >
          Menu
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-borderLight bg-card/92 px-4 py-4 dark:border-borderDark dark:bg-cardDark/95 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {marketingLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-slate-600 transition-all duration-300 hover:bg-slate-900/5 hover:text-textPrimary dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-textDark"
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setOpen(false);
                }}
                className="rounded-xl px-4 py-3 text-left text-sm text-slate-600 transition-all duration-300 hover:bg-slate-900/5 hover:text-textPrimary dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-textDark"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              {user ? (
                <NavLink
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-textPrimary px-4 py-3 text-center text-sm text-white dark:bg-white dark:text-backgroundDark"
                >
                  Open Dashboard
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm text-slate-600 transition-all duration-300 hover:bg-slate-900/5 hover:text-textPrimary dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-textDark"
                  >
                    Sign in
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-textPrimary px-4 py-3 text-center text-sm text-white dark:bg-white dark:text-backgroundDark"
                  >
                    Get Started
                  </NavLink>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
