import React, { useState, useEffect } from "react";
import { Check, Info, Save, Loader2 } from "lucide-react";
import Button from "../components/Button";
import { defaultStore } from "../data/products";
import { Store } from "../types";
import {
  isSupabaseConfigured,
  fetchStoreSettingsFromSupabase,
  saveStoreSettingsToSupabase,
  logAdminActivity
} from "../lib/supabaseClient";

export default function AdminSettings() {
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Field states
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [village, setVillage] = useState("");
  const [regency, setRegency] = useState("");
  const [province, setProvince] = useState("");
  const [workDays, setWorkDays] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [maps, setMaps] = useState("");
  const [description, setDescription] = useState("");

  // Load from Supabase on mount
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const dbStore = await fetchStoreSettingsFromSupabase();
          if (dbStore) {
            setName(dbStore.name || "");
            setWhatsapp(dbStore.whatsapp || "");
            setPhone(dbStore.phone || "");
            setAddress(dbStore.address || "");
            setVillage(dbStore.village || "");
            setRegency(dbStore.regency || "");
            setProvince(dbStore.province || "");
            setWorkDays(dbStore.workDays || "");
            setWorkHours(dbStore.workHours || "");
            setMaps(dbStore.maps || "");
            setDescription(dbStore.description || "");
          }
        } catch (err) {
          console.warn("Gagal memuat pengaturan toko dari Supabase:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fallback for offline mode
        setName(defaultStore.name);
        setWhatsapp(defaultStore.whatsapp);
        setPhone(defaultStore.whatsapp); // fallback
        setAddress(defaultStore.address);
        setWorkDays(defaultStore.workDays);
        setWorkHours(defaultStore.workHours);
        setMaps(defaultStore.maps);
        setDescription(defaultStore.description);
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setIsSaving(true);

    const cleanWhatsapp = whatsapp.replace(/\D/g, "");
    const cleanPhone = phone.replace(/\D/g, "");

    const payload: any = {
      name: name.trim(),
      whatsapp: cleanWhatsapp,
      phone: cleanPhone || cleanWhatsapp,
      address: address.trim(),
      village: village.trim(),
      regency: regency.trim(),
      province: province.trim(),
      workDays: workDays.trim(),
      workHours: workHours.trim(),
      maps: maps.trim(),
      description: description.trim()
    };

    try {
      if (isSupabaseConfigured) {
        await saveStoreSettingsToSupabase(payload);
        await logAdminActivity(
          "Ubah Pengaturan Toko",
          `Memperbarui profil / alamat bengkel ke "${name.trim()}"`,
          "warning"
        );
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan konfigurasi toko.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-ember animate-spin" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Memuat profil konfigurasi...</p>
      </div>
    );
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
                Nomor WhatsApp Utama *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="62813..."
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Nomor Telepon Kantor
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6221..."
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
              />
            </div>

            {/* maps */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Google Maps URL / Embed Link
              </label>
              <input
                type="text"
                value={maps}
                onChange={(e) => setMaps(e.target.value)}
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-3 text-sm text-zinc-100 outline-none focus:border-ember"
              />
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

          <div className="grid gap-6 md:grid-cols-3 border-t border-line/50 pt-6">
            {/* Village */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Desa / Kelurahan
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Kelurahan..."
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-2.5 text-xs text-zinc-100 outline-none focus:border-ember"
              />
            </div>

            {/* Regency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                value={regency}
                onChange={(e) => setRegency(e.target.value)}
                placeholder="Kabupaten..."
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-2.5 text-xs text-zinc-100 outline-none focus:border-ember"
              />
            </div>

            {/* Province */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Provinsi
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Provinsi..."
                className="mt-2 w-full rounded-xl border border-line bg-panel-soft px-4 py-2.5 text-xs text-zinc-100 outline-none focus:border-ember"
              />
            </div>
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
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} /> Simpan Pengaturan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
