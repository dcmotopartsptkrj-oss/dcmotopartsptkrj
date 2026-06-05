import React, { useMemo, useState, useEffect } from "react";
import { Edit2, Plus, Trash2, X, Check, Save, Loader2, Upload, Database, RefreshCw, FolderPlus, List, Tag } from "lucide-react";
import { defaultProducts } from "../data/products";
import { Product, Category } from "../types";
import { formatPrice, slugify } from "../utils/format";
import Button from "../components/Button";
import {
  isSupabaseConfigured,
  uploadProductImage,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchProductsFromSupabase,
  fetchCategoriesFromSupabase,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase,
  logAdminActivity
} from "../lib/supabaseClient";

interface SpecRow {
  key: string;
  value: string;
}

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

  // State Products
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // State Categories
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // Product Form Fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [sku, setSku] = useState("");
  const [image, setImage] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);

  // Category Form Fields
  const [catNameInput, setCatNameInput] = useState("");
  const [catSlugInput, setCatSlugInput] = useState("");
  const [catLabelInput, setCatLabelInput] = useState("");
  const [catIconInput, setCatIconInput] = useState("Oil");
  const [catSortOrder, setCatSortOrder] = useState(0);

  // File upload fields
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Populate Categories & Products from Supabase on mount
  const syncAllData = async () => {
    setIsSyncing(true);
    if (isSupabaseConfigured) {
      try {
        const dbProducts = await fetchProductsFromSupabase();
        setProducts(dbProducts || []);

        const dbCats = await fetchCategoriesFromSupabase();
        setCategoriesList(dbCats || []);
        
        // Setup initial default selected category ID for form
        if (dbCats && dbCats.length > 0) {
          setCategoryId(dbCats[0].id);
          setCategoryName(dbCats[0].name);
        }
      } catch (err) {
        console.warn("Gagal meminta data Supabase:", err);
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Offline mock data
      setProducts(defaultProducts);
      const offlineCats = [
        { id: "1", slug: "oil", name: "Oli & Cairan", label: "Oli & Cairan", icon: "Oil", sort_order: 1 },
        { id: "2", slug: "brake", name: "Pengereman", label: "Pengereman", icon: "Brake", sort_order: 2 },
        { id: "3", slug: "electric", name: "Kelistrikan", label: "Kelistrikan", icon: "Electric", sort_order: 3 },
        { id: "4", slug: "engine", name: "Suku Cadang Mesin", label: "Suku Cadang Mesin", icon: "Engine", sort_order: 4 },
        { id: "5", slug: "tire", name: "Ban & Rantai", label: "Ban & Rantai", icon: "Tire", sort_order: 5 },
      ];
      setCategoriesList(offlineCats);
      setCategoryId("1");
      setCategoryName("Oli & Cairan");
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncAllData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categoriesList.filter(
      (c) =>
        c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
        (c.label || "").toLowerCase().includes(catSearch.toLowerCase()) ||
        c.slug.toLowerCase().includes(catSearch.toLowerCase())
    );
  }, [categoriesList, catSearch]);

  const fallbackCategories = [
    { id: "oil", slug: "oil", name: "Oli & Cairan", label: "Oli", icon: "Oil" },
    { id: "brake", slug: "brake", name: "Pengereman", label: "Rem", icon: "Brake" },
    { id: "electric", slug: "electric", name: "Kelistrikan", label: "Kelistrik", icon: "Electric" },
    { id: "engine", slug: "engine", name: "Suku Cadang Mesin", label: "Mesin", icon: "Engine" },
    { id: "tire", slug: "tire", name: "Ban & Rantai", label: "Ban", icon: "Tire" }
  ];

  const actualCategories = categoriesList.length > 0 ? categoriesList : fallbackCategories;

  // Add Product Spec Row helpers
  function handleAddSpecRow() {
    setSpecRows([...specRows, { key: "", value: "" }]);
  }

  function handleRemoveSpecRow(idx: number) {
    setSpecRows(specRows.filter((_, i) => i !== idx));
  }

  function handleSpecChange(idx: number, field: "key" | "value", text: string) {
    const updated = [...specRows];
    updated[idx][field] = text;
    setSpecRows(updated);
  }

  // File Upload Helper
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setUploadError("");
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Format berkas tidak didukung. Silakan unggah format JPG, PNG, atau WEBP.");
      return;
    }

    const limitBytes = 5 * 1024 * 1024;
    if (file.size > limitBytes) {
      setUploadError("Ukuran file terlalu besar. Batas ukuran maksimal adalah 5MB.");
      return;
    }

    setImageFile(file);

    if (isSupabaseConfigured) {
      setIsUploading(true);
      uploadProductImage(file)
        .then((res) => {
          setImage(res.publicUrl);
          setImagePath(res.path);
          setImagePreview(res.publicUrl);
        })
        .catch((err: any) => {
          setUploadError(err.message || "Gagal mengunggah gambar ke Supabase.");
          setImageFile(null);
          setImagePreview("");
        })
        .finally(() => {
          setIsUploading(false);
        });
    } else {
      const localUrl = URL.createObjectURL(file);
      setImagePreview(localUrl);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setImagePath("");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview("");
    setImage("");
    setImagePath("");
    setUploadError("");
  }

  // Reset Product form
  function resetForm() {
    setEditingId(null);
    setName("");
    if (actualCategories.length > 0) {
      setCategoryId(String(actualCategories[0].id));
      setCategoryName(actualCategories[0].name);
    }
    setPrice(0);
    setStock(1);
    setSku("");
    setImage("");
    setImagePath("");
    setSummary("");
    setDescription("");
    setSpecRows([]);
    setShowForm(false);
    setImageFile(null);
    setImagePreview("");
    setUploadError("");
    setIsUploading(false);
  }

  // Reset Category form
  function resetCategoryForm() {
    setEditingCatId(null);
    setCatNameInput("");
    setCatSlugInput("");
    setCatLabelInput("");
    setCatIconInput("Oil");
    setCatSortOrder(0);
    setShowCatForm(false);
  }

  // Init product edit
  function handleEditInit(p: Product) {
    setEditingId(p.id);
    setName(p.name);
    
    // Find matching category
    const catMatch = actualCategories.find(c => c.name === p.category || c.slug === p.categorySlug);
    if (catMatch) {
      setCategoryId(String(catMatch.id));
      setCategoryName(catMatch.name);
    } else {
      setCategoryId("");
      setCategoryName(p.category);
    }

    setPrice(p.price);
    setStock(p.stock);
    setSku(p.sku);
    setImage(p.image);
    setImagePath(p.imagePath || "");
    setSummary(p.summary);
    setDescription(p.description);
    setImagePreview(p.image);
    setImageFile(null);
    setUploadError("");

    const rows = p.specs ? Object.entries(p.specs).map(([key, value]) => ({ key, value })) : [];
    setSpecRows(rows);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Init category edit
  function handleEditCatInit(cat: any) {
    setEditingCatId(String(cat.id));
    setCatNameInput(cat.name);
    setCatSlugInput(cat.slug);
    setCatLabelInput(cat.label || "");
    setCatIconInput(cat.icon || "Oil");
    setCatSortOrder(cat.sort_order || cat.sortOrder || 0);
    setShowCatForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Cat name typing auto-slugify
  function handleCatNameType(val: string) {
    setCatNameInput(val);
    if (!editingCatId) {
      setCatSlugInput(slugify(val));
    }
  }

  // Save Product (Create or Edit)
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (!image) {
      setUploadError("Unggah gambar atau tunggu progres upload di atas.");
      return;
    }

    const specsRecord: Record<string, string> = {};
    specRows.forEach((row) => {
      if (row.key.trim() && row.value.trim()) {
        specsRecord[row.key.trim()] = row.value.trim();
      }
    });

    const status: "available" | "soldout" = stock > 0 ? "available" : "soldout";
    const badge = status === "available" ? "Tersedia" : "Stok Habis";
    const generatedSlug = slugify(name);

    // Identify current category info
    const matchedCategoryObj = actualCategories.find(c => String(c.id) === String(categoryId));
    const catName = matchedCategoryObj ? matchedCategoryObj.name : categoryName || "Produk";
    const catSlug = matchedCategoryObj ? matchedCategoryObj.slug : "oil";

    const productPayload: any = {
      id: editingId || `p-${Date.now()}`,
      name: name.trim(),
      slug: generatedSlug,
      category: catName,
      categorySlug: catSlug,
      categoryId: categoryId,
      price: Number(price),
      stock: Number(stock),
      status,
      badge,
      sku: sku.trim() || `SKU-${Math.floor(Math.random() * 90000 + 10000)}`,
      image: image,
      imagePath: imagePath,
      summary: summary.trim(),
      description: description.trim(),
      specs: specsRecord
    };

    setIsSyncing(true);
    try {
      if (isSupabaseConfigured) {
        await saveProductToSupabase(productPayload);
        await logAdminActivity(
          editingId ? "Perbarui Produk" : "Tambah Produk Baru",
          `Produk "${name.trim()}" (${sku}) berhasil ${editingId ? "diperbarui" : "disimpan"}`,
          editingId ? "warning" : "success"
        );
      }
      
      // Update local set
      if (editingId) {
        setProducts(products.map(p => p.id === editingId ? productPayload : p));
      } else {
        setProducts([productPayload, ...products]);
      }
      resetForm();
    } catch (err: any) {
      console.error("Gagal menyimpan produk:", err);
      setUploadError(err.message || "Gagal menyimpan detail produk ke database.");
    } finally {
      setIsSyncing(false);
    }
  }

  // Delete Product
  async function handleDelete(id: string, prodName: string) {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${prodName}" dari katalog?`)) {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured) {
          await deleteProductFromSupabase(id);
          await logAdminActivity(
            "Hapus Produk",
            `Mengeksekusi penghapusan produk "${prodName}" dari catalog`,
            "danger"
          );
        }
        setProducts(products.filter((p) => p.id !== id));
      } catch (err: any) {
        alert(err.message || "Gagal menghapus produk dari database.");
      } finally {
        setIsSyncing(false);
      }
    }
  }

  // Save Category (Create or Edit)
  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catNameInput.trim() || !catSlugInput.trim()) return;

    const categoryPayload = {
      id: editingCatId || undefined,
      slug: catSlugInput.toLowerCase().trim(),
      name: catNameInput.trim(),
      label: catLabelInput.trim() || catNameInput.trim(),
      icon: catIconInput,
      sort_order: Number(catSortOrder),
    };

    setIsSyncing(true);
    try {
      if (isSupabaseConfigured) {
        const saved = await saveCategoryToSupabase(categoryPayload);
        await logAdminActivity(
          editingCatId ? "Perbarui Kategori" : "Tambah Kategori Baru",
          `Kategori "${catNameInput.trim()}" (${catSlugInput}) berhasil ${editingCatId ? "diperbarui" : "dibuat"}`,
          editingCatId ? "warning" : "success"
        );
        
        // Refresh full categories
        const freshCats = await fetchCategoriesFromSupabase();
        setCategoriesList(freshCats || []);
      } else {
        // Mock fallback update
        const mockSaved = { ...categoryPayload, id: editingCatId || `cat-${Date.now()}` };
        if (editingCatId) {
          setCategoriesList(categoriesList.map(c => String(c.id) === editingCatId ? mockSaved : c));
        } else {
          setCategoriesList([...categoriesList, mockSaved]);
        }
      }
      resetCategoryForm();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kategori.");
    } finally {
      setIsSyncing(false);
    }
  }

  // Delete Category
  async function handleDeleteCategory(id: string, name: string) {
    if (window.confirm(`Menghapus kategori "${name}" akan membuat produk dengan kategori ini tidak terkelompokkan. Lanjutkan?`)) {
      setIsSyncing(true);
      try {
        if (isSupabaseConfigured) {
          await deleteCategoryFromSupabase(id);
          await logAdminActivity(
            "Hapus Kategori",
            `Menghapus kategori "${name}"`,
            "danger"
          );
          
          // Refresh list
          const freshCats = await fetchCategoriesFromSupabase();
          setCategoriesList(freshCats || []);
        } else {
          setCategoriesList(categoriesList.filter(c => String(c.id) !== id));
        }
      } catch (err: any) {
        alert(err.message || "Gagal menghapus kategori.");
      } finally {
        setIsSyncing(false);
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">Produk & Kategori</h2>
          <p className="text-zinc-500 mt-1 text-sm font-medium">
            Kelola data katalog motor, tambah kategori, and atur spesifikasi detail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncAllData}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel p-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-panel-soft cursor-pointer transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            Sinkron
          </button>

          {activeTab === "products" && !showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-ember-dark cursor-pointer shadow-glow"
            >
              <Plus size={16} />
              Tambah Produk
            </button>
          )}

          {activeTab === "categories" && !showCatForm && (
            <button
              onClick={() => { resetCategoryForm(); setShowCatForm(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-peach px-5 py-3 text-xs font-black uppercase tracking-wider text-night hover:bg-white cursor-pointer shadow-glow"
            >
              <FolderPlus size={16} />
              Tambah Kategori
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-line gap-4">
        <button
          onClick={() => { setActiveTab("products"); resetCategoryForm(); }}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest border-b-2 transition cursor-pointer ${
            activeTab === "products"
              ? "border-ember text-ember bg-ember/5"
              : "border-transparent text-zinc-500 hover:text-zinc-200"
          }`}
        >
          <List size={14} />
          Daftar Suku Cadang ({products.length})
        </button>
        <button
          onClick={() => { setActiveTab("categories"); resetForm(); }}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest border-b-2 transition cursor-pointer ${
            activeTab === "categories"
              ? "border-peach text-peach bg-peach/5"
              : "border-transparent text-zinc-500 hover:text-zinc-200"
          }`}
        >
          <Tag size={12} />
          Daftar Kategori ({categoriesList.length})
        </button>
      </div>

      {isSyncing && products.length === 0 && (
        <div className="flex flex-col items-center justify-center p-24 bg-panel/20 rounded-2xl border border-line">
          <Loader2 className="w-10 h-10 text-ember animate-spin" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Menghubungkan Supabase...</p>
        </div>
      )}

      {/* PRODUCT SUB-MODULE */}
      {activeTab === "products" && (
        <>
          {showForm && (
            <div className="panel p-6 sm:p-8 bg-panel border-line">
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <h3 className="text-base font-black uppercase tracking-wider text-peach">
                  {editingId ? "Edit Suku Cadang" : "Tambah Suku Cadang Baru"}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-line p-2 text-zinc-400 hover:text-white hover:bg-panel-soft cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {uploadError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-xs font-semibold">
                    {uploadError}
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Nama Suku Cadang *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Oli Mesin Motul GP 10W-40"
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                    />
                  </div>

                  {/* Category dropdown (loaded from real Categories table) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Kategori Produk *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setCategoryId(id);
                        const matched = actualCategories.find(c => String(c.id) === String(id));
                        if (matched) setCategoryName(matched.name);
                      }}
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember cursor-pointer"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {actualCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Harga Spesial Bengkel (IDR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price || ""}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="Contoh: 125000"
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Stok Gudang *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      SKU / Kode Suku Cadang
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Kosongkan untuk auto-generate kode..."
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                    />
                  </div>

                  {/* Media Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Gambar Suku Cadang *
                    </label>
                    
                    <div className="mt-2 flex items-center gap-4">
                      {imagePreview ? (
                        <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-line bg-panel">
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition shadow"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-line rounded-xl p-5 text-center flex flex-col items-center justify-center cursor-pointer hover:border-ember/50 transition bg-panel-soft h-20 w-20 shrink-0">
                          <Upload className="text-zinc-500 w-5 h-5" />
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}

                      <div className="flex-grow">
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="Atau masukkan link gambar eksternal di sini..."
                          className="w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-xs text-zinc-100 outline-none focus:border-ember"
                        />
                        {isUploading && (
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-ember font-extrabold uppercase tracking-widest animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah ke Bucket Supabase Storage...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Ringkasan Singkat (Short Summary)
                  </label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Tulis ringkasan kemasan, kecocokan motor, dll..."
                    className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Deskripsi Lengkap
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tulis spesifikasi lengkap produk, garansi, keunggulan di motor..."
                    className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                  />
                </div>

                {/* Specifications Rows */}
                <div className="space-y-4 pt-4 border-t border-line">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-[#ffb3aa]">
                      Spesifikasi Detail (Sifat Fisik / Dimensi)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-peach/50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#ffb3aa] hover:bg-peach hover:text-night cursor-pointer"
                    >
                      + Tambah Baris Spek
                    </button>
                  </div>

                  {specRows.length > 0 ? (
                    <div className="grid gap-3 max-h-56 overflow-y-auto pr-2">
                      {specRows.map((row, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <input
                            type="text"
                            required
                            value={row.key}
                            onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                            placeholder="Contoh: Ukuran"
                            className="w-1/3 rounded-xl border border-line bg-panel-soft px-4 py-2.5 text-xs text-zinc-100 outline-none focus:border-ember"
                          />
                          <input
                            type="text"
                            required
                            value={row.value}
                            onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                            placeholder="Contoh: 100/80 - 17"
                            className="flex-grow rounded-xl border border-line bg-panel-soft px-4 py-2.5 text-xs text-zinc-100 outline-none focus:border-ember"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecRow(idx)}
                            className="rounded-xl border border-red-500/30 p-2.5 text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">Belum ada spesifikasi khusus ditambahkan.</p>
                  )}
                </div>

                <div className="pt-6 border-t border-line flex flex-col sm:flex-row gap-4 sm:justify-end">
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingId ? "Simpan Perubahan" : "Simpan Suku Suku Cadang"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Catalog products list */}
          <div className="panel overflow-hidden border-line">
            <div className="p-5 flex flex-wrap items-center gap-4 justify-between border-b border-line bg-panel/40">
              <div className="text-sm font-bold uppercase tracking-widest text-white font-sans">
                Katalog ({filteredProducts.length} Suku Cadang)
              </div>
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, SKU, kategori..."
                  className="rounded-xl border border-line bg-panel-soft px-4 py-2.5 text-xs text-zinc-100 outline-none w-56 placeholder:text-zinc-500 focus:border-ember"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredProducts.length > 0 ? (
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#111] uppercase tracking-widest text-[10px] text-peach font-black border-b border-line">
                    <tr>
                      <th className="px-6 py-4">Suku Cadang</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Harga Bengkel</th>
                      <th className="px-6 py-4">SKU / Kode Part</th>
                      <th className="px-6 py-4">Stok Gudang</th>
                      <th className="px-6 py-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-panel-soft/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-lg object-cover bg-zinc-200 shrink-0 border border-line/50"
                            />
                            <div>
                              <p className="font-extrabold text-white text-sm">{p.name}</p>
                              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                {p.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-400">{p.category}</td>
                        <td className="px-6 py-4 font-black text-peach">{formatPrice(p.price)}</td>
                        <td className="px-6 py-4 font-mono text-zinc-500">{p.sku || "-"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${
                              p.status === "soldout"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {p.status === "soldout" ? "Habis" : `${p.stock} Unit`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditInit(p)}
                              className="rounded-xl border border-line p-2 text-zinc-400 hover:text-white hover:bg-panel-soft cursor-pointer"
                              title="Sunting Suku Cadang"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="rounded-xl border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10 cursor-pointer"
                              title="Hapus Suku Cadang"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center text-zinc-500 italic">
                  Tidak ada data produk suku cadang.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* CATEGORY SUB-MODULE */}
      {activeTab === "categories" && (
        <>
          {showCatForm && (
            <div className="panel p-6 sm:p-8 bg-panel border-line">
              <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                <h3 className="text-base font-black uppercase tracking-wider text-peach">
                  {editingCatId ? "Edit Kategori" : "Tambah Kategori Baru"}
                </h3>
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="rounded-xl border border-line p-2 text-zinc-400 hover:text-white hover:bg-panel-soft cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-6 max-w-2xl">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Category Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Nama Kategori *
                    </label>
                    <input
                      type="text"
                      required
                      value={catNameInput}
                      onChange={(e) => handleCatNameType(e.target.value)}
                      placeholder="Contoh: Aksesoris Modifikasi"
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Slug Kategori *
                    </label>
                    <input
                      type="text"
                      required
                      value={catSlugInput}
                      onChange={(e) => setCatSlugInput(e.target.value)}
                      placeholder="Contoh: aksesoris"
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                    />
                  </div>

                  {/* Label */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Tag / Label Tampilan
                    </label>
                    <input
                      type="text"
                      value={catLabelInput}
                      onChange={(e) => setCatLabelInput(e.target.value)}
                      placeholder="Contoh: Aksesoris"
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                    />
                  </div>

                  {/* Icon Slug */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Ikon (Lucide Name)
                    </label>
                    <select
                      value={catIconInput}
                      onChange={(e) => setCatIconInput(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember cursor-pointer"
                    >
                      <option value="Oil">Oil (Oli)</option>
                      <option value="Brake">Brake (Rem)</option>
                      <option value="Electric">Electric (Kelistrikan)</option>
                      <option value="Engine">Engine (Mesin)</option>
                      <option value="Tire">Tire (Rantai/Ban)</option>
                      <option value="Settings">Gear (Setting)</option>
                      <option value="Sliders">Slider (Kustom)</option>
                      <option value="Disc">Disc (Casing)</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Urutan Penyaringan (Sor Order)
                    </label>
                    <input
                      type="number"
                      value={catSortOrder}
                      onChange={(e) => setCatSortOrder(Number(e.target.value))}
                      className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-line flex gap-4 justify-end">
                  <Button type="button" variant="secondary" onClick={resetCategoryForm}>
                    Batal
                  </Button>
                  <Button type="submit">
                    {editingCatId ? "Simpan Perubahan Kategori" : "Simpan Kategori Baru"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Categories Table list */}
          <div className="panel overflow-hidden border-line">
            <div className="p-5 flex flex-wrap items-center gap-4 justify-between border-b border-line bg-panel/40">
              <div className="text-sm font-bold uppercase tracking-widest text-[#ffb3aa] font-sans">
                Kategori Terdaftar ({filteredCategories.length} Kategori)
              </div>
              <div className="relative">
                <input
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Cari kategori..."
                  className="rounded-xl border border-line bg-panel-soft px-4 py-2.5 text-xs text-zinc-100 outline-none w-56 placeholder:text-zinc-500 focus:border-ember"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredCategories.length > 0 ? (
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#111] uppercase tracking-widest text-[10px] text-peach font-black border-b border-line">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Nama Kategori</th>
                      <th className="px-6 py-4">Slug URL</th>
                      <th className="px-6 py-4">Label Menu</th>
                      <th className="px-6 py-4">Ikon</th>
                      <th className="px-6 py-4">Urutan No</th>
                      <th className="px-6 py-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredCategories.map((c) => (
                      <tr key={c.id} className="hover:bg-panel-soft/10">
                        <td className="px-6 py-4 font-mono text-zinc-500 max-w-[100px] truncate" title={c.id}>
                          {c.id}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-white text-sm">{c.name}</td>
                        <td className="px-6 py-4 font-mono font-semibold text-ember">{c.slug}</td>
                        <td className="px-6 py-4 font-semibold text-zinc-400">{c.label || "-"}</td>
                        <td className="px-6 py-4 font-mono text-zinc-400">{c.icon || "Oil"}</td>
                        <td className="px-6 py-4 font-extrabold text-[#ffb3aa]">{c.sort_order ?? c.sortOrder ?? 0}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditCatInit(c)}
                              className="rounded-xl border border-line p-2 text-zinc-400 hover:text-white hover:bg-panel-soft cursor-pointer"
                              title="Sunting Kategori"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(String(c.id), c.name)}
                              className="rounded-xl border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10 cursor-pointer"
                              title="Hapus Kategori"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center text-zinc-500 italic">
                  Tidak ada data kategori terdaftar.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
