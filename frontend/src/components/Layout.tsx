import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const APP_PATHS = ["/dashboard", "/health", "/doctor", "/admin", "/assistant", "/bmi", "/doctors", "/settings"];

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
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

  return (
    <div className="page-shell flex min-h-screen flex-col">
      <Navbar />
      <main
        className={
          isAppSurface
            ? "mx-auto flex w-full max-w-7xl flex-grow flex-col px-4 py-8 sm:px-6"
            : "flex w-full flex-grow flex-col py-8"
        }
      >
        {children}
      </main>
      <footer className="border-t border-[var(--color-border)] bg-[rgba(255,255,255,0.48)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--color-text-soft)] sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-[var(--color-text)]">CarePath</div>
            <div className="mt-1 max-w-xl">
              {isAppSurface
                ? `Signed in${user ? ` as ${user.name}` : ""}. Your care workspace stays connected across tracking, AI guidance, and follow-up.`
                : "A modern healthcare SaaS experience for tracking, understanding, and acting on your health with more clarity."}
            </div>
          </div>
          <div className="flex gap-6">
            {isAppSurface ? (
              <>
                <a href={user?.role === "admin" ? "/admin" : user?.role === "doctor" ? "/doctor" : "/dashboard"} className="hover:text-[var(--color-text)]">
                  Dashboard
                </a>
                <a href="/assistant" className="hover:text-[var(--color-text)]">
                  AI Assistant
                </a>
                <a href="/settings" className="hover:text-[var(--color-text)]">
                  Settings
                </a>
              </>
            ) : (
              <>
                <a href="/#features" className="hover:text-[var(--color-text)]">
                  Features
                </a>
                <a href="/#doctors" className="hover:text-[var(--color-text)]">
                  Doctors
                </a>
                <a href="/#cta" className="hover:text-[var(--color-text)]">
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
