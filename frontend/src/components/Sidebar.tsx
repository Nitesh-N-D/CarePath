import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type SidebarItem = {
  to: string;
  label: string;
  roles: Array<"user" | "doctor" | "admin">;
};

const items: SidebarItem[] = [
  { to: "/dashboard", label: "Dashboard", roles: ["user"] },
  { to: "/doctor", label: "Dashboard", roles: ["doctor"] },
  { to: "/admin", label: "Dashboard", roles: ["admin"] },
  { to: "/health", label: "Health", roles: ["user"] },
  { to: "/bmi", label: "BMI Calculator", roles: ["user", "doctor", "admin"] },
  { to: "/assistant", label: "AI Assistant", roles: ["user", "doctor", "admin"] },
  { to: "/doctors", label: "Doctors", roles: ["user", "admin"] },
  { to: "/settings", label: "Settings", roles: ["user", "doctor", "admin"] },
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

          <nav className="mt-6 space-y-2">
            {visibleItems.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                className={({ isActive }) =>
                  `app-sidebar-link ${isActive ? "app-sidebar-link-active" : ""}`
                }
              >
                <span className="h-2.5 w-2.5 rounded-full bg-current/70" />
                <span>{item.label}</span>
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
            {item.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}

export default Sidebar;
