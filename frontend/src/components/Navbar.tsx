import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import GradientButton from "./ui/GradientButton";
import Separator from "./ui/Separator";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/#platform", label: "Platform" },
    { href: "/#features", label: "Features" },
    { href: "/#knowledge", label: "Knowledge" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[rgba(255,250,244,0.72)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#183c38_0%,#31544d_58%,#8b6a46_100%)] font-semibold text-white shadow-[0_10px_24px_rgba(38,31,26,0.16)]">
            CP
          </div>
          <div>
            <div className="text-lg font-semibold text-[var(--color-text)]">CarePath</div>
            <div className="text-xs text-[var(--color-text-soft)]">Personal health guidance and disease reference</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-[var(--color-text-soft)] transition duration-200 hover:bg-[rgba(49,88,79,0.08)] hover:text-[var(--color-text)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button type="button" variant="outline" onClick={toggleTheme} className="rounded-full px-3">
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.62)] px-4 py-2 text-sm text-[var(--color-text)] shadow-sm">
                <span>{user.name}</span>
                <div className="w-8">
                  <Separator />
                </div>
                <Badge tone="muted" className="tracking-[0.14em]">
                  {user.role}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-full"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" className="rounded-full">
                Sign in
              </Button>
              <GradientButton to="/register" className="px-4 py-2 text-sm">
                Get started
              </GradientButton>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen((current) => !current)}
          className="rounded-full md:hidden"
        >
          Menu
        </Button>
      </div>

      {open ? (
        <div className="border-t border-[var(--color-border)] bg-[rgba(255,250,244,0.92)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm text-[var(--color-text)] transition hover:bg-[rgba(49,88,79,0.08)]"
              >
                {item.label}
              </a>
            ))}
            {user ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    toggleTheme();
                    setOpen(false);
                  }}
                  className="justify-start rounded-2xl px-4 py-3 text-sm"
                >
                  {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                </Button>
                <Button
                  to="/dashboard"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="justify-start rounded-2xl px-4 py-3 text-sm"
                >
                  Dashboard
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="justify-start rounded-2xl px-4 py-3 text-sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  to="/login"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="justify-start rounded-2xl px-4 py-3 text-sm"
                >
                  Sign in
                </Button>
                <Button
                  to="/register"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="justify-start rounded-2xl px-4 py-3 text-sm"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
