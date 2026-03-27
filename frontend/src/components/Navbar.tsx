import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./ui/Button";

type NavItem = {
  to: string;
  label: string;
};

const APP_PATHS = ["/dashboard", "/health", "/doctor", "/admin", "/assistant", "/bmi", "/doctors", "/settings"];

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashboardPath = useMemo(() => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "doctor") return "/doctor";
    return "/dashboard";
  }, [user?.role]);

  const isAppSurface = useMemo(
    () =>
      APP_PATHS.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`)),
    [location.pathname]
  );

  const items = useMemo<NavItem[]>(() => {
    if (!isAppSurface || !user) {
      return [
        { to: "/#features", label: "Features" },
        { to: "/#insights", label: "Insights" },
        { to: "/#ai-showcase", label: "AI" },
        { to: "/#doctors", label: "Doctors" },
        { to: "/#workflow", label: "Workflow" },
      ];
    }

    if (user.role === "doctor") {
      return [
        { to: "/doctor", label: "Dashboard" },
        { to: "/bmi", label: "BMI Calculator" },
        { to: "/assistant", label: "AI Assistant" },
        { to: "/settings", label: "Settings" },
      ];
    }

    if (user.role === "admin") {
      return [
        { to: "/admin", label: "Dashboard" },
        { to: "/bmi", label: "BMI Calculator" },
        { to: "/assistant", label: "AI Assistant" },
        { to: "/doctors", label: "Doctors" },
        { to: "/settings", label: "Settings" },
      ];
    }

    return [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/bmi", label: "BMI Calculator" },
      { to: "/health", label: "Health" },
      { to: "/assistant", label: "AI Assistant" },
      { to: "/doctors", label: "Doctors" },
      { to: "/settings", label: "Settings" },
    ];
  }, [isAppSurface, user]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  const renderNavLink = (item: NavItem, mobile = false) => (
    <NavLink
      key={item.label}
      to={item.to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `${mobile ? "px-4 py-3" : "px-4 py-2"} rounded-xl text-sm transition ${
          isActive
            ? "bg-[var(--color-accent-soft)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_var(--color-border)]"
            : "text-[var(--color-text-soft)] hover:bg-[var(--color-accent-soft)]/70 hover:text-[var(--color-text)]"
        }`
      }
    >
      {item.label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(248,250,252,0.72)] backdrop-blur-xl dark:bg-[rgba(11,18,32,0.82)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#0891b2_55%,#38bdf8_100%)] font-semibold text-white shadow-[0_10px_24px_rgba(8,145,178,0.28)]">
            CP
          </div>
          <div>
            <div className="text-base font-semibold text-[var(--color-text)]">CarePath</div>
            <div className="text-xs text-[var(--color-text-soft)]">
              {isAppSurface && user ? "Your connected care workspace" : "Health intelligence, reimagined"}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {items.map((item) => renderNavLink(item))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-accent-soft)]"
          >
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>
          {user && isAppSurface ? (
            <>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-2 text-sm text-[var(--color-text)]">
                {user.name}
              </div>
              <Button type="button" variant="ghost" onClick={handleLogout} className="rounded-xl">
                Logout
              </Button>
            </>
          ) : (
            <>
              {user ? (
                <Button to={dashboardPath} variant="ghost" className="rounded-xl">
                  Open Dashboard
                </Button>
              ) : (
                <Button to="/login" variant="ghost" className="rounded-xl">
                  Sign in
                </Button>
              )}
              <Button to={user ? dashboardPath : "/register"} className="rounded-xl">
                {user ? "Go to App" : "Get Started"}
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2 text-sm text-[var(--color-text)] lg:hidden"
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
            className="border-t border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-4 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {items.map((item) => renderNavLink(item, true))}
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setOpen(false);
                }}
                className="rounded-xl px-4 py-3 text-left text-sm text-[var(--color-text-soft)] hover:bg-[var(--color-accent-soft)]/70 hover:text-[var(--color-text)]"
              >
                {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
              </button>
              {user && isAppSurface ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-3 text-left text-sm text-[var(--color-text-soft)] hover:bg-[var(--color-accent-soft)]/70 hover:text-[var(--color-text)]"
                >
                  Logout
                </button>
              ) : (
                <>
                  {user ? (
                    <NavLink
                      to={dashboardPath}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm text-[var(--color-text-soft)] hover:bg-[var(--color-accent-soft)]/70 hover:text-[var(--color-text)]"
                    >
                      Open Dashboard
                    </NavLink>
                  ) : (
                    <NavLink
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm text-[var(--color-text-soft)] hover:bg-[var(--color-accent-soft)]/70 hover:text-[var(--color-text)]"
                    >
                      Sign in
                    </NavLink>
                  )}
                  <NavLink
                    to={user ? dashboardPath : "/register"}
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-[var(--color-text)] px-4 py-3 text-center text-sm text-[var(--color-bg)]"
                  >
                    {user ? "Go to App" : "Get Started"}
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
