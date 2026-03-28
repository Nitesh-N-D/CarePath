import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type SidebarItem = {
  to: string;
  label: string;
  roles: Array<"user" | "doctor" | "admin">;
  icon: (props: { active?: boolean }) => ReactElement;
};

function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3.5 10.5h5v6h-5zM11.5 3.5h5v4h-5zM11.5 10.5h5v6h-5zM3.5 3.5h5v4h-5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M10 16.2s-5.5-3.5-5.5-8.1A3.2 3.2 0 0 1 10 6a3.2 3.2 0 0 1 5.5 2.1c0 4.6-5.5 8.1-5.5 8.1Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10h1.8l1-2.1 1.4 4.1 1-2H13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BmiIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 14.5A6 6 0 1 1 16 14.5" strokeLinecap="round" />
      <path d="M10 8.5l2.4 3.2" strokeLinecap="round" />
      <path d="M10 13.8h.01" strokeLinecap="round" />
    </svg>
  );
}

function AssistantIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="4" width="13" height="10" rx="3" />
      <path d="M7 17l2.2-3h1.6L13 17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 8.5h5M7.5 11h3.5" strokeLinecap="round" />
    </svg>
  );
}

function DoctorsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M10 6.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM5.2 17v-1.1A3.7 3.7 0 0 1 8.9 12h2.2a3.7 3.7 0 0 1 3.7 3.7V17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.8 7.2v4M13.8 9.2h4" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M10 6.8A3.2 3.2 0 1 0 10 13.2 3.2 3.2 0 1 0 10 6.8Z" />
      <path d="M16.5 10a1.7 1.7 0 0 0-.1-.6l1.2-1a.7.7 0 0 0 .1-.9l-1.1-1.9a.7.7 0 0 0-.9-.3l-1.4.6a5.8 5.8 0 0 0-1-.6L13 3.7a.7.7 0 0 0-.7-.5h-2.2a.7.7 0 0 0-.7.5l-.3 1.5a5.8 5.8 0 0 0-1 .6l-1.4-.6a.7.7 0 0 0-.9.3L4.7 7.4a.7.7 0 0 0 .1.9l1.2 1a1.7 1.7 0 0 0 0 1.2l-1.2 1a.7.7 0 0 0-.1.9l1.1 1.9a.7.7 0 0 0 .9.3l1.4-.6a5.8 5.8 0 0 0 1 .6l.3 1.5a.7.7 0 0 0 .7.5h2.2a.7.7 0 0 0 .7-.5l.3-1.5a5.8 5.8 0 0 0 1-.6l1.4.6a.7.7 0 0 0 .9-.3l1.1-1.9a.7.7 0 0 0-.1-.9l-1.2-1c.1-.2.1-.4.1-.6Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const items: SidebarItem[] = [
  { to: "/dashboard", label: "Dashboard", roles: ["user"], icon: DashboardIcon },
  { to: "/doctor", label: "Dashboard", roles: ["doctor"], icon: DashboardIcon },
  { to: "/admin", label: "Dashboard", roles: ["admin"], icon: DashboardIcon },
  { to: "/health", label: "Health", roles: ["user"], icon: HealthIcon },
  { to: "/bmi", label: "BMI Calculator", roles: ["user", "doctor", "admin"], icon: BmiIcon },
  { to: "/assistant", label: "AI Assistant", roles: ["user", "doctor", "admin"], icon: AssistantIcon },
  { to: "/doctors", label: "Doctors", roles: ["user", "admin"], icon: DoctorsIcon },
  { to: "/settings", label: "Settings", roles: ["user", "doctor", "admin"], icon: SettingsIcon },
];

function Sidebar() {
  const { user } = useAuth();
  const visibleItems = items.filter((item) => (user ? item.roles.includes(user.role) : false));

  return (
    <>
      <aside className="hidden w-80 shrink-0 xl:block">
        <div className="app-sidebar-surface sticky top-0 flex min-h-screen flex-col px-6 py-6">
          <div className="rounded-2xl border border-borderLight bg-card/80 p-5 shadow-soft dark:border-borderDark dark:bg-cardDark/80">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white shadow-md">
                CP
              </div>
              <div>
                <div className="text-base font-semibold text-textPrimary dark:text-textDark">CarePath</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.role === "admin" ? "Admin workspace" : user?.role === "doctor" ? "Clinician workspace" : "Patient workspace"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          <nav className="mt-4 space-y-2.5">
            {visibleItems.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                className={({ isActive }) => `app-sidebar-link ${isActive ? "app-sidebar-link-active" : ""}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`app-sidebar-icon ${isActive ? "app-sidebar-icon-active" : ""}`}>
                      <item.icon active={isActive} />
                    </span>
                    <span className="truncate">{item.label}</span>
                    <span className={`app-sidebar-indicator ${isActive ? "opacity-100" : "opacity-0"}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 xl:hidden">
        {visibleItems.map((item) => (
          <NavLink
            key={`mobile-${item.to}-${item.label}`}
            to={item.to}
            className={({ isActive }) =>
              `shrink-0 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "border-primary/20 bg-primary/10 text-primary dark:border-accent/30 dark:bg-accent/10 dark:text-accent"
                  : "border-borderLight bg-card/90 text-slate-600 hover:scale-[1.02] dark:border-borderDark dark:bg-cardDark/90 dark:text-slate-300"
              }`
            }
          >
            <span className="mr-2 inline-flex align-middle">
              <item.icon />
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}

export default Sidebar;
