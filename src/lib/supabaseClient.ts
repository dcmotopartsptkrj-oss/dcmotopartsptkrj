/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const PRODUCT_IMAGE_BUCKET = "product-images";
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Vercel Environment Variables."
    );
  }

  return supabase;
}

function isUuid(value?: string) {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function cleanFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

function normalizeProduct(item: any) {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    categoryId: item.category_id,
    category: item.categories?.name || "Produk",
    categorySlug: item.categories?.slug || "oil",
    price: item.price,
    stock: item.stock,
    status: item.status,
    badge: item.status === "soldout" ? "Stok Habis" : "Tersedia",
    sku: item.sku,
    image: item.image_url || "",
    imagePath: item.image_path || "",
    summary: item.summary || "",
    description: item.description || "",
    specs: item.specs || {},
    isFeatured: item.is_featured || false,
    sortOrder: item.sort_order || 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export async function uploadProductImage(file: File): Promise<{
  publicUrl: string;
  path: string;
}> {
  const client = ensureSupabase();

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Tipe berkas harus JPG, PNG, atau WEBP.");
  }

  const fileSizeMb = file.size / 1024 / 1024;

  if (fileSizeMb > MAX_FILE_SIZE_MB) {
    throw new Error("Ukuran berkas melebihi batas maksimal 5MB.");
  }

  const fileExt = file.name.split(".").pop() || "jpg";
  const baseName = cleanFileName(file.name.replace(`.${fileExt}`, ""));
  const randomId = Math.random().toString(36).substring(2, 10);
  const filePath = `products/${Date.now()}-${randomId}-${baseName}.${fileExt}`;

  const { error: uploadError } = await client.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah gambar ke Supabase: ${uploadError.message}`);
  }

  const { data } = client.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error("Gagal mendapatkan URL publik dari gambar yang diunggah.");
  }

  return {
    publicUrl: data.publicUrl,
    path: filePath,
  };
}

export async function fetchCategoriesFromSupabase(): Promise<any[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil kategori: ${error.message}`);
  }

  return data || [];
}

async function getCategoryIdBySlug(categorySlug: string): Promise<string | null> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("categories")
    .select("id")
    .eq("slug", categorySlug || "oil")
    .single();

  if (error) {
    console.warn("Category lookup error:", error.message);
    return null;
  }

  return data?.id || null;
}

export async function fetchProductsFromSupabase(): Promise<any[]> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("products")
    .select(
      `
      *,
      categories:category_id (
        id,
        slug,
        name,
        label,
        icon
      )
    `
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil produk dari Supabase: ${error.message}`);
  }

  return (data || []).map(normalizeProduct);
}

export async function fetchProductBySlugFromSupabase(slug: string): Promise<any | null> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("products")
    .select(
      `
      *,
      categories:category_id (
        id,
        slug,
        name,
        label,
        icon
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.warn("Supabase product detail error:", error.message);
    return null;
  }

  return normalizeProduct(data);
}

export async function saveProductToSupabase(product: any): Promise<any> {
  const client = ensureSupabase();

  const categoryId =
    product.categoryId || (await getCategoryIdBySlug(product.categorySlug || "oil"));

  const payload = {
    category_id: categoryId,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    status: product.status || "available",
    image_url: product.image || product.imageUrl || null,
    image_path: product.imagePath || null,
    summary: product.summary || "",
    description: product.description || "",
    specs: product.specs || {},
    is_featured: Boolean(product.isFeatured),
    sort_order: Number(product.sortOrder || 0),
    updated_at: new Date().toISOString(),
  };

  let query;

  if (isUuid(product.id)) {
    query = client
      .from("products")
      .update(payload)
      .eq("id", product.id)
      .select(
        `
        *,
        categories:category_id (
          id,
          slug,
          name,
          label,
          icon
        )
      `
      )
      .single();
  } else {
    query = client
      .from("products")
      .upsert(payload, { onConflict: "slug" })
      .select(
        `
        *,
        categories:category_id (
          id,
          slug,
          name,
          label,
          icon
        )
      `
      )
      .single();
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal menyimpan produk ke Supabase: ${error.message}`);
  }

  return normalizeProduct(data);
}

export async function deleteProductFromSupabase(idOrSlug: string): Promise<void> {
  const client = ensureSupabase();

  const query = isUuid(idOrSlug)
    ? client.from("products").delete().eq("id", idOrSlug)
    : client.from("products").delete().eq("slug", idOrSlug);

  const { error } = await query;

  if (error) {
    throw new Error(`Gagal menghapus produk dari Supabase: ${error.message}`);
  }
}

export async function fetchStoreSettingsFromSupabase(): Promise<any | null> {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`Gagal mengambil pengaturan toko: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    whatsapp: data.whatsapp,
    phone: data.phone,
    address: data.address,
    village: data.village,
    regency: data.regency,
    province: data.province,
    workDays: data.work_days,
    workHours: data.work_hours,
    maps: data.maps_url,
    description: data.description,
  };
}

export async function saveStoreSettingsToSupabase(store: any): Promise<any> {
  const client = ensureSupabase();

  const payload = {
    id: 1,
    name: store.name,
    whatsapp: store.whatsapp,
    phone: store.phone,
    address: store.address,
    village: store.village,
    regency: store.regency,
    province: store.province,
    work_days: store.workDays,
    work_hours: store.workHours,
    maps_url: store.maps,
    description: store.description,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("store_settings")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan pengaturan toko: ${error.message}`);
  }

  return data;
}

export async function signInAdmin(email: string, password: string): Promise<any> {
  const client = ensureSupabase();

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Login gagal: ${error.message}`);
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    throw new Error(`Gagal membaca profil admin: ${profileError.message}`);
  }

  if (profile?.role !== "admin") {
    await client.auth.signOut();
    throw new Error("Akun ini belum memiliki akses admin.");
  }

  return {
    session: data.session,
    user: data.user,
    profile,
  };
}

export async function signOutAdmin(): Promise<void> {
  const client = ensureSupabase();
  await client.auth.signOut();
}

export async function getCurrentAdmin(): Promise<any | null> {
  const client = ensureSupabase();

  const { data } = await client.auth.getSession();

  if (!data.session?.user) {
    return null;
  }

  const { data: profile, error } = await client
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", data.session.user.id)
    .single();

  if (error || profile?.role !== "admin") {
    return null;
  }

  return {
    user: data.session.user,
    profile,
    session: data.session,
  };
}
