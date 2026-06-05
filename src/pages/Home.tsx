import {
  Headphones,
  PackageCheck,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import { categories, defaultProducts, defaultStore } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Product, Store } from "../types";
import {
  isSupabaseConfigured,
  fetchProductsFromSupabase,
  fetchStoreSettingsFromSupabase
} from "../lib/supabaseClient";

const benefits = [
  {
    icon: <PackageCheck size={26} />,
    title: "Produk Lengkap",
    text: "Dari part harian hingga kebutuhan balap profesional."
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Harga Bersaing",
    text: "Jaminan harga terbaik dengan kualitas original pilihan."
  },
  {
    icon: <Truck size={26} />,
    title: "Pengiriman Cepat",
    text: "Stok siap kirim untuk wilayah lokal dan sekitarnya."
  },
  {
    icon: <Headphones size={26} />,
    title: "Support CS",
    text: "Konsultasi teknis cepat dengan tim mekanik berpengalaman."
  }
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [store, setStore] = useState<Store>(defaultStore);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const dbProducts = await fetchProductsFromSupabase();
          setProducts(dbProducts || []);

          const dbStore = await fetchStoreSettingsFromSupabase();
          if (dbStore) {
            setStore(dbStore);
          }
        } catch (err) {
          console.warn("Gagal memuat data beranda dari Supabase:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Offline preview mode when Supabase is unconfigured
        setProducts(defaultProducts);
        setStore(defaultStore);
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const bestSellers = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-night">
      <Header />

      <section className="relative overflow-hidden bg-hero-radial">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute inset-x-0 mx-auto top-0 h-[520px] w-[520px] rounded-full bg-ember/20 blur-3xl" />
        </div>

        <div className="container-page relative flex min-h-[580px] flex-col items-center justify-center py-20 text-center">
          <div className="flex flex-col items-center">

            <h1 className="max-w-4xl text-5xl font-black uppercase leading-tight tracking-tight text-zinc-100 sm:text-6xl lg:text-7xl font-sans">
              Sparepart Motor
              <span className="mt-2 block text-peach">Lengkap & Cepat</span>
            </h1>
            <p className="mt-8 max-w-xl text-center text-sm leading-7 text-zinc-400 sm:text-base border-t-2 border-ember/30 pt-6">
              Presisi dalam setiap komponen. Performa tanpa kompromi untuk mesin
              kesayangan Anda.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
              <Button to="/products">Belanja Sekarang</Button>
              <Button to="/products" variant="secondary">
                Lihat Kategori
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="container-page py-20">
        <SectionHeading
          eyebrow="Eksplorasi Part"
          title="Kategori Pilihan Bengkel Profesional"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} large={index === 0} />
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Best Sellers" title="Produk Paling Dicari" />
          <Button to="/products" variant="secondary">
            Lihat Semua Produk
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} store={store} />
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-panel text-peach">
                {item.icon}
              </div>
              <h3 className="mt-5 text-sm font-extrabold uppercase tracking-[.2em] font-sans">
                {item.title}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-xs leading-6 text-zinc-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>



      <Footer />
    </div>
  );
}
