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
            Google Maps
          </h4>
          <div className="mt-4 flex flex-col gap-3">
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
              <iframe
                title="Google Maps Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent("DC MOTOPARTS, " + store.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="absolute inset-0 w-full h-full opacity-70 filter invert-[90%] hue-rotate-180 contrast-90 transition duration-300 group-hover:opacity-90"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a 
              href="https://share.google/6uppTYIOKeBqJ6yJI" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-peach hover:text-ember transition duration-200"
            >
              Lihat Rute & Lokasi →
            </a>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Kunjungi bengkel kami secara langsung untuk pemasangan & layanan terbaik.
            </p>
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
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col justify-between gap-3 border-t border-line py-6 text-xs text-zinc-600 sm:flex-row">
        <p>© 2026 DC Motoparts by Kelompok 8 BD-03-C</p>
        <p>v1.0 Built for Speed</p>
      </div>
    </footer>
  );
}
