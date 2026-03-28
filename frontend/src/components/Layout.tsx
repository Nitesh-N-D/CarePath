import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Button from "./ui/Button";
import ThemeToggle from "./ui/ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

const APP_PATHS = ["/dashboard", "/health", "/doctor", "/admin", "/assistant", "/bmi", "/doctors", "/settings"];

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAppSurface = APP_PATHS.some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.getElementById(location.hash.slice(1));
    if (target) {
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [location.hash, location.pathname]);

  if (isAppSurface) {
    return (
      <div className="app-shell flex min-h-screen flex-col">
        <div className="flex min-h-screen flex-1">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="topbar-shell">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary dark:text-accent">
                    CarePath
                  </div>
                  <div className="mt-1 text-lg font-semibold text-textPrimary dark:text-textDark sm:text-xl">
                    {user?.role === "admin" ? "Admin dashboard" : user?.role === "doctor" ? "Clinician dashboard" : "Health dashboard"}
                  </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:justify-end">
                  <ThemeToggle />

                  <div className="min-w-0 rounded-xl border border-borderLight bg-card/90 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-borderDark dark:bg-cardDark/90 dark:text-slate-300">
                    {user?.name || "CarePath member"}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="rounded-xl"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-4 py-6 sm:px-6 sm:py-8">
              {children}
            </main>
          </div>
        </div>

        <footer className="border-t border-borderLight bg-card/60 dark:border-borderDark dark:bg-cardDark/50">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between dark:text-slate-400">
            <div>CarePath keeps tracking, AI guidance, and follow-up in one connected workspace.</div>
            <div className="flex flex-wrap gap-4 sm:gap-5">
              <a href="/settings" className="hover:text-textPrimary dark:hover:text-textDark">Settings</a>
              <a href="/assistant" className="hover:text-textPrimary dark:hover:text-textDark">AI Assistant</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="flex w-full flex-grow flex-col py-6 sm:py-8">{children}</main>
      <footer className="border-t border-borderLight bg-card/60 dark:border-borderDark dark:bg-cardDark/50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between dark:text-slate-400">
          <div>
            <div className="font-semibold text-textPrimary dark:text-textDark">CarePath</div>
            <div className="mt-1 max-w-xl">
              A modern healthcare SaaS experience for tracking, understanding, and acting on your health with more clarity.
            </div>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <a href="/#features" className="hover:text-textPrimary dark:hover:text-textDark">Features</a>
            <a href="/#doctors" className="hover:text-textPrimary dark:hover:text-textDark">Doctors</a>
            <a href="/register" className="hover:text-textPrimary dark:hover:text-textDark">Get Started</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
