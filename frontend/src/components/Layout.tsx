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
      <div className="min-h-screen text-slate-900">
        <Navbar />
        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-10">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">{children}</main>
      <footer className="border-t border-white/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>CarePath turns daily health signals into guidance, clarity, and connected care.</p>
          <p>{new Date().getFullYear()} CarePath. Built for modern medical journeys.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
