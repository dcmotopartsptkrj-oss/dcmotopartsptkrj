import {
  Menu,
  Search,
  UserRound,
  X
} from "lucide-react";
import { useState, FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { defaultStore } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Store } from "../types";
import { getWhatsAppHref } from "../utils/format";

const navItems = [
  { label: "Beranda", path: "/" },
  { label: "Kategori", path: "/products" },
  { label: "Produk", path: "/products" },
  { label: "Tentang Kami", path: "/#about" },
  { label: "Kontak", path: "/#contact" }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [store] = useLocalStorage<Store>("dc_store", defaultStore);
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!keyword.trim()) return;
    navigate(`/products?q=${encodeURIComponent(keyword.trim())}`);
    setKeyword("");
    setOpen(false);
  }

  const parts = store.name.split(" ");
  const firstWord = (parts[0] || "DC").toUpperCase();
  let restOfWords = parts.slice(1).join(" ") || "MOTOPARTS";
  if (restOfWords.toUpperCase() === "MOTOPART" || restOfWords.toUpperCase() === "MOTOPARTS") {
    restOfWords = "MOTOPARTS";
  } else {
    restOfWords = restOfWords.toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-night/90 backdrop-blur-xl">
      <div className="container-page flex min-h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-ember rounded-lg flex items-center justify-center font-black text-white italic tracking-tighter text-sm transition group-hover:bg-ember-dark">
            {firstWord}
          </div>
          <span className="text-xl font-black uppercase tracking-widest text-peach font-sans transition group-hover:text-white">
            {restOfWords}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            if (item.label === "Kontak") {
              return (
                <a
                  key={item.label}
                  href={getWhatsAppHref(store.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-wider transition text-zinc-400 hover:text-peach"
                >
                  {item.label}
                </a>
              );
            }
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `text-xs font-bold uppercase tracking-wider transition ${
                    isActive ? "text-peach" : "text-zinc-400 hover:text-peach"
                  }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <form onSubmit={handleSubmit} className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Cari suku cadang..."
              className="w-60 rounded-xl border border-line bg-panel px-11 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-ember"
            />
          </form>
          <Link to="/admin/login" aria-label="Login admin">
            <UserRound className="text-zinc-200 transition hover:text-peach" size={20} />
          </Link>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="inline-flex rounded-xl border border-line p-3 text-zinc-100 lg:hidden cursor-pointer"
          aria-label="Buka menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-carbon lg:hidden">
          <div className="container-page space-y-4 py-5">
            <form onSubmit={handleSubmit} className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Cari suku cadang..."
                className="input-dark pl-11"
              />
            </form>

            <nav className="grid gap-2 text-center">
              {navItems.map((item) => {
                if (item.label === "Kontak") {
                  return (
                    <a
                      key={item.label}
                      href={getWhatsAppHref(store.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-line px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-300 hover:text-peach block"
                    >
                      {item.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-line px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-300 block"
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-ember px-4 py-3 text-sm font-bold uppercase tracking-wider text-white text-center block"
              >
                Admin Login
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
