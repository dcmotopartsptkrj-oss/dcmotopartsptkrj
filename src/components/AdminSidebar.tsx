import { LayoutDashboard, LogOut, Package, Settings } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const items = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products and categories", path: "/admin/products", icon: Package },
  { label: "Settings", path: "/admin/settings", icon: Settings }
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("dc_admin_auth");
    navigate("/admin/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-line bg-panel lg:block">
      <div className="flex h-full flex-col p-6">
        <div>
          <h2 className="text-xl font-black italic tracking-[.25em] text-white">
            DC MOTOPARTS
          </h2>
          <p className="mt-2 text-sm text-zinc-500">Admin Panel</p>
        </div>

        <nav className="mt-10 grid gap-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold transition ${
                    isActive
                      ? "bg-ember text-white"
                      : "text-zinc-400 hover:bg-panel-soft hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-xl px-4 py-4 text-sm font-bold text-zinc-400 transition hover:bg-panel-soft hover:text-white text-left cursor-pointer"
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
