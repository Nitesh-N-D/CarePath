import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

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
      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-[var(--color-border)] bg-[rgba(255,255,255,0.48)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--color-text-soft)] sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-[var(--color-text)]">CarePath</div>
            <div className="mt-1 max-w-xl">A modern healthcare SaaS experience for tracking, understanding, and acting on your health with more clarity.</div>
          </div>
          <div className="flex gap-6">
            <a href="/#features" className="hover:text-[var(--color-text)]">Features</a>
            <a href="/#doctors" className="hover:text-[var(--color-text)]">Doctors</a>
            <a href="/#cta" className="hover:text-[var(--color-text)]">Get Started</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
