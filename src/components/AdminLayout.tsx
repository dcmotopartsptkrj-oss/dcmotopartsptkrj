import { Menu, Search, X, LogOut, LayoutDashboard, Package, Settings } from "lucide-react";
import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("dc_admin_auth");
    navigate("/admin/login");
  }

  const items = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Products and categories", path: "/admin/products", icon: Package },
    { label: "Settings", path: "/admin/settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#242221] text-zinc-100 font-sans">
      <AdminSidebar />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-72 bg-panel border-r border-line p-6 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black italic tracking-[.25em] text-white">
                  DC MOTOPARTS
                </h2>
                <p className="mt-1 text-xs text-zinc-500">Admin Panel</p>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg border border-line cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-10 grid gap-3">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
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
        </div>
      )}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-line bg-panel/95 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-line p-3 text-zinc-200 lg:hidden cursor-pointer"
              >
                <Menu size={20} />
              </button>
              <Link to="/" className="text-xl font-black uppercase tracking-[.18em] text-white">
                DC MOTOPARTS
              </Link>
            </div>

            <div className="hidden items-center gap-3 rounded-xl bg-panel-soft px-4 py-3 md:flex">
              <Search size={18} className="text-zinc-500" />
              <input
                placeholder="Cari produk..."
                className="w-60 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                readOnly
              />
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
