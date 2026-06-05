export function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getWhatsAppHref(phone: string, productName = ""): string {
  const cleanPhone = String(phone || "").replace(/\D/g, "");
  const message = productName
    ? `Halo DC MOTOPARTS, saya ingin pesan ${productName}. Apakah stok masih tersedia?`
    : "Halo DC MOTOPARTS, saya ingin bertanya tentang produk.";

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getStatusLabel(status: string): string {
  return status === "soldout" ? "Stok Habis" : "Tersedia";
}
