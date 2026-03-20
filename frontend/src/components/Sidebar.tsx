import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  const items = [
    { to: "/dashboard", label: "My Health", roles: ["user", "admin"] },
    { to: "/doctor", label: "Doctor Panel", roles: ["doctor", "admin"] },
    { to: "/admin", label: "Admin Panel", roles: ["admin"] },
  ];

  const visibleItems = items.filter((item) => (user ? item.roles.includes(user.role) : false));

  return (
    <>
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 rounded-3xl border border-white/90 bg-white/86 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="mb-6 border-b border-stone-200 pb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Workspace</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">CarePath OS</h2>
            <p className="mt-2 text-sm text-slate-500">Health intelligence, monitoring, and connected clinical workflows.</p>
          </div>

          <nav className="space-y-2">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-stone-100 via-slate-50 to-cyan-50 text-slate-900 shadow-[0_0_0_1px_rgba(148,163,184,0.10)]"
                      : "text-slate-600 hover:bg-stone-50 hover:text-slate-900"
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
                isActive ? "bg-slate-900 text-white" : "border border-stone-200 bg-white text-slate-600"
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
