import React, { useState, useEffect } from "react";
import { Check, Info, Save } from "lucide-react";
import Button from "../components/Button";
import { defaultStore } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Store } from "../types";
import {
  isSupabaseConfigured,
  fetchStoreSettingsFromSupabase,
  saveStoreSettingsToSupabase
} from "../lib/supabaseClient";

export default function AdminSettings() {
  const [store, setStore] = useLocalStorage<Store>("dc_store", defaultStore);
  const [success, setSuccess] = useState(false);

  // Field states
  const [name, setName] = useState(store.name);
  const [whatsapp, setWhatsapp] = useState(store.whatsapp);
  const [address, setAddress] = useState(store.address);
  const [workDays, setWorkDays] = useState(store.workDays);
  const [workHours, setWorkHours] = useState(store.workHours);
  const [maps, setMaps] = useState(store.maps);
  const [description, setDescription] = useState(store.description);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadSettings() {
      if (isSupabaseConfigured) {
        try {
          const dbStore = await fetchStoreSettingsFromSupabase();
          if (dbStore) {
            setStore(dbStore);
            setName(dbStore.name);
            setWhatsapp(dbStore.whatsapp);
            setAddress(dbStore.address);
            setWorkDays(dbStore.workDays);
            setWorkHours(dbStore.workHours);
            setMaps(dbStore.maps || "");
            setDescription(dbStore.description);
          }
        } catch (err) {
          console.warn("Gagal memuat pengaturan toko dari Supabase:", err);
        }
      }
    }
    loadSettings();
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);

    // Form validation - strip non-digits for whatsapp
    const cleanWhatsapp = whatsapp.replace(/\D/g, "");

    const updatedStore: Store = {
      name: name.trim(),
      whatsapp: cleanWhatsapp,
      address: address.trim(),
      workDays: workDays.trim(),
      workHours: workHours.trim(),
      maps: maps.trim(),
      description: description.trim()
    };

    setStore(updatedStore);
    setSuccess(true);

    if (isSupabaseConfigured) {
      saveStoreSettingsToSupabase(updatedStore).catch((err) => {
        console.warn("Gagal menyimpan ke database Supabase:", err);
      });
    }

    // Auto dismiss success toast
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 font-sans max-w-4xl">
      <div>
        <h2 className="text-2xl font-black uppercase text-white">Konfigurasi Toko</h2>
        <p className="text-zinc-500 mt-1 text-sm font-medium">
          Sunting kontak WhatsApp, alamat fisik, jam buka, and informasi deskripsi DC MOTOPARTS.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 text-xs font-semibold">
          <Check className="shrink-0 animate-bounce" size={16} />
          <span>Pengaturan toko berhasil disimpan and disinkronisasikan!</span>
        </div>
      )}

      <div className="panel p-6 sm:p-8 bg-panel border-line">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Store Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Nama Bengkel / Toko *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
              />
            </div>

            {/* WA */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Nomor WhatsApp Admin (Prefiks Negara) *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="628123456789"
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
              />
              <p className="mt-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">
                Gunakan nomor murni tanpa spasi/simbol (misal: 62812...).
              </p>
            </div>

            {/* Work Days */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Hari Kerja *
              </label>
              <input
                type="text"
                required
                value={workDays}
                onChange={(e) => setWorkDays(e.target.value)}
                placeholder="Senin - Sabtu"
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
              />
            </div>

            {/* Work Hours */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Jam Operasional *
              </label>
              <input
                type="text"
                required
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                placeholder="09:00 - 18:00"
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
              />
            </div>
          </div>

          {/* Map */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Link Slocator Google Maps
            </label>
            <input
              type="url"
              value={maps}
              onChange={(e) => setMaps(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Alamat Lengkap Bengkel *
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember resize-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Deskripsi Singkat Toko (Footer & SEO) *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
            />
          </div>

          <div className="flex gap-4 items-start rounded-xl bg-panel-soft/40 p-4 border border-line text-xs font-semibold text-zinc-400">
            <Info className="shrink-0 text-peach" size={16} />
            <p className="leading-relaxed">
              Membaharui info di sini akan langsung mensinkronisasikan kontak WhatsApp di tombol detail produk untuk seluruh halaman katalog client.
            </p>
          </div>

          <div className="pt-6 border-t border-line flex justify-end">
            <Button type="submit" className="gap-2">
              <Save size={16} />
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
