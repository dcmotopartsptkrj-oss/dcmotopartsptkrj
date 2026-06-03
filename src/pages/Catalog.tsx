import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import { categories, defaultProducts, defaultStore } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Product, Store, Category } from "../types";
import {
  isSupabaseConfigured,
  fetchProductsFromSupabase,
  fetchCategoriesFromSupabase,
  fetchStoreSettingsFromSupabase
} from "../lib/supabaseClient";

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const initialCategory = params.get("category") || "all";
  const initialSearch = params.get("q") || "";
  
  const [category, setCategory] = useState(initialCategory);
  const [keyword, setKeyword] = useState(initialSearch);
  const [sort, setSort] = useState("newest");
  
  const [localProducts] = useLocalStorage<Product[]>("dc_products", defaultProducts);
  const [localStore] = useLocalStorage<Store>("dc_store", defaultStore);

  const [products, setProducts] = useState<Product[]>(localProducts);
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [store, setStore] = useState<Store>(localStore);
  const [isLoading, setIsLoading] = useState(false);

  // Sync data from Supabase if configured
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        setIsLoading(true);
        try {
          const dbProducts = await fetchProductsFromSupabase();
          if (dbProducts && dbProducts.length > 0) {
            setProducts(dbProducts);
          }

          const dbCategories = await fetchCategoriesFromSupabase();
          if (dbCategories && dbCategories.length > 0) {
            const parsedCats: Category[] = dbCategories.map((item: any) => ({
              id: item.slug || item.id,
              name: item.name || item.label || "Kategori",
              label: item.label || "",
              icon: item.icon || "Oil"
            }));
            setCategoriesList(parsedCats);
          }

          const dbStore = await fetchStoreSettingsFromSupabase();
          if (dbStore) {
            setStore(dbStore);
          }
        } catch (err) {
          console.warn("Gagal memuat katalog dari Supabase:", err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadData();
  }, []);

  // Sync state if URL search parameters change
  useEffect(() => {
    const q = params.get("q");
    if (q !== null) {
      setKeyword(q);
    }
    const cat = params.get("category");
    if (cat !== null) {
      setCategory(cat);
    }
  }, [params]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchCategory = category === "all" || product.categorySlug === category;
        const matchKeyword =
          product.name.toLowerCase().includes(keyword.toLowerCase()) ||
          product.category.toLowerCase().includes(keyword.toLowerCase()) ||
          product.sku.toLowerCase().includes(keyword.toLowerCase());

        return matchCategory && matchKeyword;
      })
      .sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        // Default / Newest is based on product ID rank reversed
        return b.id.localeCompare(a.id);
      });
  }, [category, keyword, products, sort]);

  function handleCategoryChange(catId: string) {
    setCategory(catId);
    setParams(prev => {
      if (catId === "all") {
        prev.delete("category");
      } else {
        prev.set("category", catId);
      }
      return prev;
    });
  }

  function handleKeywordChange(text: string) {
    setKeyword(text);
    setParams(prev => {
      if (!text) {
        prev.delete("q");
      } else {
        prev.set("q", text);
      }
      return prev;
    });
  }

  return (
    <div className="min-h-screen bg-night font-sans">
      <Header />

      <main className="container-page grid gap-10 py-12 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Filters */}
        <aside className="h-fit rounded-2xl border border-line bg-panel p-6 lg:sticky lg:top-28">
          <div className="flex items-center gap-2 pb-4 border-b border-line">
            <SlidersHorizontal size={18} className="text-peach" />
            <span className="text-sm font-extrabold uppercase tracking-widest text-zinc-100">
              Filter Pencarian
            </span>
          </div>

          <div className="mt-6">
            <label className="text-xs font-bold uppercase tracking-wider text-peach">
              Cari Suku Cadang
            </label>
            <div className="relative mt-3">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                value={keyword}
                onChange={(event) => handleKeywordChange(event.target.value)}
                placeholder="Model, Kategori, atau SKU..."
                className="w-full rounded-xl border border-line bg-panel-soft px-11 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-ember"
              />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-peach">
              Kategori Produk
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white cursor-pointer transition">
                <input
                  type="radio"
                  name="category"
                  checked={category === "all"}
                  onChange={() => handleCategoryChange("all")}
                  className="accent-ember h-4 w-4 cursor-pointer"
                />
                Semua Produk
              </label>
              {categoriesList.map((item) => (
                <label 
                  key={item.id} 
                  className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={category === item.id}
                    onChange={() => handleCategoryChange(item.id)}
                    className="accent-ember h-4 w-4 cursor-pointer"
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-line">
            <label className="text-xs font-bold uppercase tracking-wider text-peach">
              Urutkan Harga
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-3 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="price-low">Harga: Rendah ke Tinggi</option>
              <option value="price-high">Harga: Tinggi ke Rendah</option>
              <option value="name-asc">Nama A-Z</option>
            </select>
          </div>
        </aside>

        {/* Catalog List */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <SectionHeading
              eyebrow="Katalog DC Motopart"
              title={
                category === "all" 
                  ? "Semua Suku Cadang" 
                  : categoriesList.find(c => c.id === category)?.name || "Kategori Pilihan"
              }
            />
            <div className="flex items-center gap-3">
              {isLoading && <Loader2 className="w-4 h-4 text-ember animate-spin" />}
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest bg-panel border border-line px-4 py-2 rounded-xl h-fit w-fit">
                Menampilkan {filteredProducts.length} Produk
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} store={store} />
              ))}
            </div>
          ) : (
            <div className="panel p-16 text-center select-none flex flex-col items-center justify-center">
              <Search size={48} className="text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-zinc-300">Tidak ada produk ditemukan</h3>
              <p className="text-sm text-zinc-500 mt-2 max-w-sm">
                Coba sesuaikan kata kunci pencarian atau ganti filter kategori produk Anda.
              </p>
              <button
                onClick={() => {
                  setCategory("all");
                  setKeyword("");
                  setParams({});
                }}
                className="mt-6 rounded-xl bg-ember px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-ember-dark"
              >
                Reset Filter Pencarian
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
