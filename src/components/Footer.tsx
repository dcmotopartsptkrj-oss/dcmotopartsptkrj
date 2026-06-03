import { Mail, Share2, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { defaultStore } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Store } from "../types";

export default function Footer() {
  const [store] = useLocalStorage<Store>("dc_store", defaultStore);

  const parts = store.name.split(" ");
  const firstWord = parts[0] || "DC";
  let restOfWords = parts.slice(1).join(" ") || "MOTOPARTS";
  if (restOfWords.toUpperCase() === "MOTOPART") {
    restOfWords = "MOTOPARTS";
  }

  return (
    <footer id="contact" className="border-t border-line bg-[#050505]">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-ember rounded-lg flex items-center justify-center font-black text-white italic tracking-tighter text-xs">
              {firstWord}
            </div>
            <span className="text-lg font-black uppercase tracking-widest text-peach font-sans">
              {restOfWords}
            </span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-zinc-500">
            {store.description}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-extrabold uppercase tracking-[.22em] text-zinc-100 font-sans">
            Navigasi
          </h4>
          <div className="mt-5 grid gap-3 text-sm text-zinc-500">
            <Link to="/" className="link-hover">Beranda</Link>
            <Link to="/products" className="link-hover">Semua Produk</Link>
            <Link to="/products" className="link-hover">Pencarian Kategori</Link>
            <Link to="/#about" className="link-hover">Tentang Kami</Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-extrabold uppercase tracking-[.22em] text-zinc-100 font-sans">
            Layanan
          </h4>
          <div className="mt-5 grid gap-3 text-sm text-zinc-500">
            <span className="cursor-pointer hover:text-peach">Kebijakan Privasi</span>
            <span className="cursor-pointer hover:text-peach">Syarat & Ketentuan</span>
            <span className="cursor-pointer hover:text-peach">Informasi Pengiriman</span>
            <span className="cursor-pointer hover:text-peach">Garansi & Retur</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-extrabold uppercase tracking-[.22em] text-zinc-100 font-sans">
            Kontak Bengkel
          </h4>
          <div className="mt-5 grid gap-3 text-sm text-zinc-500">
            <p>{store.address}</p>
            <p>Hari Kerja: {store.workDays}</p>
            <p>Jam Operasional: {store.workHours}</p>
            <p>WhatsApp: +{store.whatsapp}</p>
            <div className="flex gap-4 text-zinc-300 mt-2">
              <Share2 size={18} className="cursor-pointer hover:text-peach" />
              <ThumbsUp size={18} className="cursor-pointer hover:text-peach" />
              <Mail size={18} className="cursor-pointer hover:text-peach" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col justify-between gap-3 border-t border-line py-6 text-xs text-zinc-600 sm:flex-row">
        <p>© 2026 DC Motoparts. High-Performance Engineering.</p>
        <p>v1.0 Built for Speed</p>
      </div>
    </footer>
  );
}
