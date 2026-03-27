import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  const items = [
    { to: "/", label: "Home", roles: ["user", "doctor", "admin"] },
    { to: "/dashboard", label: "My Health", roles: ["user", "admin"] },
    { to: "/doctor", label: "Doctor Panel", roles: ["doctor", "admin"] },
    { to: "/admin", label: "Admin Panel", roles: ["admin"] },
  ];

  const visibleItems = items.filter((item) => (user ? item.roles.includes(user.role) : false));

  return (
    <>
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="glass-panel sticky top-24 p-5">
          <div className="mb-6 border-b border-[var(--color-border)] pb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-soft)]">Navigation</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">CarePath</h2>
            <p className="mt-2 text-sm text-[var(--color-text-soft)]">Move between your health pages, medical references, and care dashboards.</p>
          </div>

          <nav className="space-y-2">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition duration-300 ${
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(223,238,232,0.95),rgba(255,252,247,0.9),rgba(214,176,132,0.16))] text-[var(--color-text)] shadow-[0_0_0_1px_rgba(123,97,71,0.08)]"
                      : "text-[var(--color-text-soft)] hover:bg-[rgba(49,88,79,0.08)] hover:text-[var(--color-text)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                isActive
                  ? "bg-[linear-gradient(135deg,#183c38_0%,#31544d_58%,#8b6a46_100%)] text-white"
                  : "border border-[var(--color-border)] bg-[rgba(255,255,255,0.66)] text-[var(--color-text-soft)]"
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
