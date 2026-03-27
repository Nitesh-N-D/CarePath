import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const appRoutes = ["/dashboard", "/doctor", "/admin"];

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAppRoute = appRoutes.some((route) => location.pathname.startsWith(route));

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

  if (isAppRoute) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-10">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">{children}</main>
      <footer className="glass-panel mt-8 border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-[var(--color-text-soft)] sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>CarePath is designed to make personal health records, guidance, and disease knowledge feel calmer and easier to trust.</p>
          <p>{new Date().getFullYear()} CarePath. Thoughtfully designed for everyday health decisions.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
