import React, { useMemo, useState, useEffect } from "react";
import { Edit2, Plus, Trash2, X, Check, Save, Loader2, Upload, Database, RefreshCw } from "lucide-react";
import { defaultProducts } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Product } from "../types";
import { formatPrice, slugify } from "../utils/format";
import Button from "../components/Button";
import {
  isSupabaseConfigured,
  uploadProductImage,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchProductsFromSupabase
} from "../lib/supabaseClient";

interface SpecRow {
  key: string;
  value: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>("dc_products", defaultProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  // Sync state with Supabase
  const [isSyncing, setIsSyncing] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Oli & Cairan");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [sku, setSku] = useState("");
  const [image, setImage] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);

  // File upload fields
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Load from Supabase on mount
  useEffect(() => {
    async function syncFromSupabase() {
      if (isSupabaseConfigured) {
        setIsSyncing(true);
        try {
          const dbProducts = await fetchProductsFromSupabase();
          if (dbProducts && dbProducts.length > 0) {
            setProducts(dbProducts);
          }
        } catch (err) {
          console.warn("Katalog Supabase masih kosong atau belum disinkronisasi:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    }
    syncFromSupabase();
  }, []);


  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const categoriesMap: Record<string, string> = {
    oil: "Oli & Cairan",
    brake: "Pengereman",
    electric: "Kelistrikan",
    engine: "Suku Cadang Mesin",
    tire: "Ban & Rantai"
  };

  function getCategorySlug(categoryName: string): string {
    const entry = Object.entries(categoriesMap).find(([_, value]) => value === categoryName);
    return entry ? entry[0] : "oil";
  }

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setUploadError("");
    if (!file) return;

    // Validate type limit
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Format berkas tidak didukung. Silakan unggah format JPG, PNG, atau WEBP.");
      return;
    }

    // Validate size limit (5MB)
    const limitBytes = 5 * 1024 * 1024;
    if (file.size > limitBytes) {
      setUploadError("Ukuran file terlalu besar. Batas ukuran maksimal adalah 5MB.");
      return;
    }

    setImageFile(file);

    // If Supabase is configured, upload immediately
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
      // Offline fallback: Use local object URL for preview and base64 for data storage
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

  function resetForm() {
    setEditingId(null);
    setName("");
    setCategory("Oli & Cairan");
    setPrice(0);
    setStock(1);
    setSku("");
    setImage("");
    setImagePath("");
    setSummary("");
    setDescription("");
    setSpecRows([]);
    setShowForm(false);
    
    // Reset file upload states
    setImageFile(null);
    setImagePreview("");
    setUploadError("");
    setIsUploading(false);
  }

  function handleEditInit(p: Product) {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setStock(p.stock);
    setSku(p.sku);
    setImage(p.image);
    setImagePath(p.imagePath || "");
    setSummary(p.summary);
    setDescription(p.description);
    
    // Set previews
    setImagePreview(p.image);
    setImageFile(null);
    setUploadError("");

    // Parse specs dict into rows
    const rows = p.specs ? Object.entries(p.specs).map(([key, value]) => ({ key, value })) : [];
    setSpecRows(rows);
    setShowForm(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (!image) {
      setUploadError("Anda wajib mengunggah gambar produk sebelum menyimpan.");
      return;
    }

    // Convert specRows to dictionary
    const specsRecord: Record<string, string> = {};
    specRows.forEach((row) => {
      if (row.key.trim() && row.value.trim()) {
        specsRecord[row.key.trim()] = row.value.trim();
      }
    });

    const status: "available" | "soldout" = stock > 0 ? "available" : "soldout";
    const badge = status === "available" ? "Tersedia" : "Stok Habis";
    const generatedSlug = slugify(name);

    if (editingId) {
      // Editing Mode
      const updatedProduct: Product = {
        id: editingId,
        name: name.trim(),
        slug: generatedSlug,
        category: category,
        categorySlug: getCategorySlug(category),
        price: Number(price),
        stock: Number(stock),
        status,
        badge,
        sku: sku.trim(),
        image: image,
        imagePath: imagePath,
        summary: summary.trim(),
        description: description.trim(),
        specs: specsRecord
      };

      const updatedProducts = products.map((p) => {
        if (p.id === editingId) {
          return updatedProduct;
        }
        return p;
      });

      setProducts(updatedProducts);

      if (isSupabaseConfigured) {
        saveProductToSupabase(updatedProduct).catch((err) => {
          console.warn("Gagal diunggah ke database online Supabase:", err);
        });
      }
    } else {
      // Add Mode
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name: name.trim(),
        slug: generatedSlug,
        category: category,
        categorySlug: getCategorySlug(category),
        price: Number(price),
        stock: Number(stock),
        status,
        badge,
        sku: sku.trim() || `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
        image: image,
        imagePath: imagePath,
        summary: summary.trim(),
        description: description.trim(),
        specs: specsRecord
      };

      setProducts([newProduct, ...products]);

      if (isSupabaseConfigured) {
        saveProductToSupabase(newProduct).catch((err) => {
          console.warn("Gagal diunggah ke database online Supabase:", err);
        });
      }
    }

    resetForm();
  }

  function handleDelete(id: string) {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini dari katalog?")) {
      const remaining = products.filter((p) => p.id !== id);
      setProducts(remaining);

      if (isSupabaseConfigured) {
        deleteProductFromSupabase(id).catch((err) => {
          console.warn("Gagal menghapus produk dari database online Supabase:", err);
        });
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white">Kelola Suku Cadang</h2>
          <p className="text-zinc-500 mt-1 text-sm font-medium">
            Tambah, sunting, and perbarui daftar sparepart motor di website.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-ember-dark cursor-pointer shadow-glow self-start sm:self-auto"
          >
            <Plus size={16} />
            Tambah Suku Cadang
          </button>
        )}
      </div>

      {/* Editor & Creator Form Panel */}
      {showForm && (
        <div className="panel p-6 sm:p-8 bg-panel border-line">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
            <h3 className="text-base font-black uppercase tracking-wider text-peach font-sans">
              {editingId ? "Edit Suku Cadang" : "Tambah Suku Cadang Baru"}
            </h3>
            <button
              onClick={resetForm}
              className="rounded-xl border border-line p-2 text-zinc-400 hover:text-white hover:bg-panel-soft cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Nama Suku Cadang *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ketik nama produk..."
                  className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember cursor-pointer"
                >
                  {Object.values(categoriesMap).map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Harga Suku Cadang (IDR) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Contoh: 150000"
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
                  Kode SKU / Kode Part
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Contoh: CH-SSS-420"
                  className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
                />
              </div>

              {/* Image Upload Area */}
              <div className="md:col-span-2 border-t border-line/40 pt-6">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-3">
                  Unggah Gambar Suku Cadang * <span className="text-zinc-650 font-medium font-sans lowercase">(JPG, PNG, atau WEBP, maks. 5MB)</span>
                </label>

                <div className="grid gap-6 sm:grid-cols-12 items-start bg-panel-soft/20 p-5 rounded-2xl border border-line">
                  {/* Preview section */}
                  <div className="sm:col-span-4 bg-panel-soft border border-line rounded-xl p-4 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group">
                    {imagePreview ? (
                      <div className="relative w-full h-[140px] flex items-center justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview suku cadang"
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-1 -right-1 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition cursor-pointer shadow-lg"
                          title="Hapus Gambar"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-zinc-500 text-xs p-4">
                        <p className="font-bold text-zinc-400">Belum ada file</p>
                        <p className="text-[10px] mt-1 text-zinc-600">Unggah file pengereman, cairan, dll.</p>
                      </div>
                    )}
                  </div>

                  {/* Input / Drag State section */}
                  <div className="sm:col-span-8 space-y-4">
                    <div className="relative border-2 border-dashed border-line hover:border-ember transition-colors rounded-xl p-6 flex flex-col items-center justify-center bg-panel-soft/40 cursor-pointer min-h-[140px] text-center group">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      {isUploading ? (
                        <>
                          <Loader2 className="animate-spin text-ember mb-2" size={24} />
                          <p className="text-xs font-bold text-white">Mengunggah file ke Supabase...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="text-zinc-500 group-hover:text-ember mb-2 transition-colors" size={24} />
                          <p className="text-xs font-bold text-zinc-300">
                            Pilih gambar produk atau seret ke sini
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
                            JPG, PNG, atau WEBP murni
                          </p>
                        </>
                      )}
                    </div>

                    {uploadError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl font-bold font-sans">
                        ⚠ {uploadError}
                      </div>
                    )}

                    {isSupabaseConfigured ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                        <Database size={12} /> Live Sync ke Supabase Storage "product-images"
                      </div>
                    ) : (
                      <div className="bg-[#ff4b1f]/5 border border-[#ff4b1f]/10 p-3 rounded-lg text-left">
                        <div className="text-[10px] text-peach font-black uppercase tracking-widest">
                          ⚠ Mode Offline (Local Browser Storage)
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                          Anda sedang dalam mode pratinjau. Gambar akan disimpan dalam format lokal (Base64/URL objek) agar halaman client tetap dapat menampilkan gambar Anda secara nyata.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Ringkasan Produk (1 kalimat singkat) *
              </label>
              <textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Pelumas sintetis berperforma tinggi..."
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember resize-none"
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
                placeholder="Tuliskan spesifikasi detail penggunaan, keunggulan oli / rem ini..."
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
              />
            </div>

            {/* Specs Dynamic Rows */}
            <div className="pt-4 border-t border-line space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Daftar Spesifikasi Suku Cadang (Key-Value)
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
                        placeholder="Label Contoh: Bahan"
                        className="w-1/3 rounded-xl border border-line bg-panel-soft px-4 py-2.5 text-xs text-zinc-100 outline-none focus:border-ember"
                      />
                      <input
                        type="text"
                        required
                        value={row.value}
                        onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                        placeholder="Nilai Contoh: Baja Murni"
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
                {editingId ? "Simpan Perubahan" : "Simpan Produk"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Table area */}
      <div className="panel overflow-hidden border-line">
        <div className="p-5 flex flex-wrap items-center gap-4 justify-between border-b border-line bg-panel/40">
          <div className="text-sm font-bold uppercase tracking-widest text-white font-sans">
            Katalog ({filteredProducts.length} Item Suku Cadang)
          </div>
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode SKU, model, dll..."
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
                  <th className="px-6 py-4">SKU / Part Code</th>
                  <th className="px-6 py-4">Stok Gudang</th>
                  <th className="px-6 py-4 text-center">Aksi Kerja</th>
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
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${
                          p.status === "soldout"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {p.status === "soldout" ? "Habis" : `${p.stock} Unit`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditInit(p)}
                          className="rounded-xl border border-line p-2 text-zinc-400 hover:text-white hover:bg-panel-soft cursor-pointer"
                          title="Sunting Suku Cadang"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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
              Tidak ada produk yang sesuai dengan pencarian Anda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
