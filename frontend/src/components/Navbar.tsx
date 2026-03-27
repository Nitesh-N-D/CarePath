import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./ui/Button";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const dashboardPath = user?.role === "admin" ? "/admin" : user?.role === "doctor" ? "/doctor" : "/dashboard";
    const healthPath = user?.role === "doctor" ? "/doctor" : "/health";
    const doctorsPath = user?.role === "doctor" ? "/doctor" : "/doctors";

    return [
      { to: dashboardPath, label: "Dashboard" },
      { to: "/bmi", label: "BMI Calculator" },
      { to: healthPath, label: "Health" },
      { to: "/assistant", label: "AI Assistant" },
      { to: doctorsPath, label: "Doctors" },
      { to: "/settings", label: "Settings" },
    ];
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(11,18,32,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#0891b2_55%,#38bdf8_100%)] font-semibold text-white shadow-[0_10px_24px_rgba(8,145,178,0.28)]">
            CP
          </div>
          <div>
            <div className="text-base font-semibold text-white">CarePath</div>
            <div className="text-xs text-slate-300">Health intelligence, reimagined</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>
          {user ? (
            <>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {user.name}
              </div>
              <Button type="button" variant="ghost" onClick={handleLogout} className="rounded-xl text-slate-200 hover:bg-white/10">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" className="rounded-xl text-slate-200 hover:bg-white/10">
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
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 lg:hidden"
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
            className="border-t border-white/10 bg-[rgba(11,18,32,0.96)] px-4 py-4 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm ${
                      isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
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
                className="rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Logout
                </button>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                    Sign in
                  </NavLink>
                  <NavLink to="/register" onClick={() => setOpen(false)} className="rounded-xl bg-white text-center px-4 py-3 text-sm text-slate-900">
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
