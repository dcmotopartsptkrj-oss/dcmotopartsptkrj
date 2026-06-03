import { ArrowLeft, Check, ShoppingBag, X, Loader2 } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductVisual from "../components/ProductVisual";
import SectionHeading from "../components/SectionHeading";
import ProductCard from "../components/ProductCard";
import { defaultProducts, defaultStore } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Product, Store } from "../types";
import { formatPrice, getStatusLabel, getWhatsAppHref } from "../utils/format";
import {
  isSupabaseConfigured,
  fetchProductBySlugFromSupabase,
  fetchProductsFromSupabase,
  fetchStoreSettingsFromSupabase
} from "../lib/supabaseClient";

export default function ProductDetail() {
  const { slug } = useParams();
  const [localProducts] = useLocalStorage<Product[]>("dc_products", defaultProducts);
  const [localStore] = useLocalStorage<Store>("dc_store", defaultStore);

  const [products, setProducts] = useState<Product[]>(localProducts);
  const [store, setStore] = useState<Store>(localStore);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load details and related resources
  useEffect(() => {
    async function initDetails() {
      setIsLoading(true);
      
      // Default offline fallback
      const fallbackProd = localProducts.find((p) => p.slug === slug) || null;
      setProduct(fallbackProd);

      if (isSupabaseConfigured && slug) {
        try {
          const dbProduct = await fetchProductBySlugFromSupabase(slug);
          if (dbProduct) {
            setProduct(dbProduct);
          }

          const dbProducts = await fetchProductsFromSupabase();
          if (dbProducts && dbProducts.length > 0) {
            setProducts(dbProducts);
          }

          const dbStore = await fetchStoreSettingsFromSupabase();
          if (dbStore) {
            setStore(dbStore);
          }
        } catch (err) {
          console.warn("Gagal sinkron detail produk dengan Supabase:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    initDetails();
  }, [slug]);

  // Find related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-night flex flex-col justify-between">
        <Header />
        <main className="container-page flex-grow flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-ember animate-spin" />
            <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">Memuat Detail Produk...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-night flex flex-col">
        <Header />
        <main className="container-page flex-grow py-24 text-center">
          <X className="mx-auto text-danger" size={64} />
          <h2 className="text-3xl font-black uppercase text-white mt-6">Produk Tidak Ditemukan</h2>
          <p className="text-zinc-500 mt-3">Detail item berkode "{slug}" kemungkinan telah dihapus atau dipindahkan.</p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-ember px-6 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-ember-dark"
            >
              <ArrowLeft size={16} />
              Kembali ke Katalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSoldOut = product.status === "soldout";

  return (
    <div className="min-h-screen bg-night font-sans">
      <Header />

      <main className="container-page py-12">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-peach hover:text-white"
          >
            <ArrowLeft size={14} />
            Katalog Suku Cadang
          </Link>
        </div>

        {/* Product Box */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Visual Container */}
          <div className="bg-zinc-100 p-6 rounded-2xl border border-line flex flex-col justify-center max-h-[580px]">
            <div className="relative h-full overflow-hidden rounded-xl bg-zinc-200">
              <ProductVisual src={product.image} alt={product.name} className="min-h-[360px] sm:min-h-[460px]" />
              <span
                className={`absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest ${
                  isSoldOut
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {getStatusLabel(product.status)}
              </span>
            </div>
          </div>

          {/* Details Container */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.25em] text-ember">
                {product.category}
              </p>
              <h1 className="mt-4 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-extrabold tracking-widest uppercase">
                {product.sku && (
                  <span className="border border-line bg-panel px-3 py-1.5 rounded-lg text-zinc-400">
                    SKU: {product.sku}
                  </span>
                )}
                <span className="border border-line bg-panel px-3 py-1.5 rounded-lg text-zinc-400">
                  Stok: {isSoldOut ? "Habis" : `${product.stock} Unit`}
                </span>
              </div>

              {/* Price Tag */}
              <div className="mt-8 border-t border-b border-line py-6 bg-panel/30 px-6 rounded-xl">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Harga Spesial Bengkel
                </p>
                <p className="mt-2 text-3xl font-black text-peach">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Summary / Body Description */}
              <p className="mt-6 text-sm leading-7 text-zinc-400">
                {product.summary}
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {product.description}
              </p>
            </div>

            {/* CTA Order Area */}
            <div className="mt-8 pt-8 border-t border-line">
              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href={getWhatsAppHref(store.whatsapp, product.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 rounded-xl bg-peach px-6 py-4 text-xs font-black uppercase tracking-wider text-night hover:bg-white text-center transition"
                >
                  <ShoppingBag size={18} />
                  Pesan via WhatsApp
                </a>
                <div className="flex flex-col justify-center text-xs text-zinc-500 font-bold uppercase tracking-wider pl-4 border-l border-line">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check size={14} /> Jaminan Original
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 mt-1">
                    <Check size={14} /> Free Konsultasi Mekanik
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <h3 className="text-xl font-black uppercase tracking-wider text-white mb-6">
              Spesifikasi Detail Suku Cadang:
            </h3>
            <div className="overflow-hidden rounded-2xl border border-line bg-panel">
              <table className="w-full text-left text-sm text-zinc-300">
                <tbody>
                  {Object.entries(product.specs).map(([label, val], idx) => (
                    <tr 
                      key={label} 
                      className={`border-b border-line last:border-0 ${
                        idx % 2 === 0 ? "bg-panel-soft/20" : "bg-panel/40"
                      }`}
                    >
                      <th className="px-6 py-4 font-bold text-peach w-1/3 border-r border-line/50 uppercase tracking-wider text-[11px]">
                        {label}
                      </th>
                      <td className="px-6 py-4 font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <div className="mb-8">
              <SectionHeading eyebrow="Opsi Alternatif" title="Produk Terkait" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
