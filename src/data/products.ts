import { Product, Category, Store, ActivityLog, ChartData } from "../types";

export const defaultStore: Store = {
  name: "DC Motoparts",
  whatsapp: "6285727324791",
  address: "Patikraja, Banyumas, Jawa Tengah",
  workDays: "Senin - Sabtu",
  workHours: "09:00 - 18:00",
  maps: "https://maps.google.com/dcmotopart",
  description:
    "Penyedia suku cadang motor performa tinggi dan pelumas berkualitas terbaik untuk kebutuhan otomotif Anda."
};

export const categories: Category[] = [
  {
    id: "oil",
    name: "Oli & Cairan",
    label: "High performance fluids",
    icon: "Oil"
  },
  {
    id: "brake",
    name: "Pengereman",
    label: "Kontrol dan keamanan",
    icon: "Brake"
  },
  {
    id: "electric",
    name: "Kelistrikan",
    label: "Arus stabil",
    icon: "Bolt"
  },
  {
    id: "engine",
    name: "Suku Cadang Mesin",
    label: "Performa mesin",
    icon: "Cog"
  },
  {
    id: "tire",
    name: "Ban & Rantai",
    label: "Grip dan transmisi",
    icon: "Circle"
  }
];

export const defaultProducts: Product[] = [
  {
    id: "p-001",
    slug: "oli-yamalube-matic",
    name: "Oli Yamalube Matic 20W-40",
    categorySlug: "oil",
    category: "Oli & Cairan",
    price: 45000,
    stock: 34,
    status: "available",
    badge: "Tersedia",
    sku: "YM-2024-08X",
    image: "/src/assets/images/oli_yamalube_matic_1780484749609.png",
    summary:
      "Pelumas Yamalube Matic berkualitas premium untuk akselerasi ekstra halus dan perlindungan mesin tangguh.",
    description:
      "Yamalube Matic direkayasa khusus untuk memenuhi standar spesifikasi sepeda motor matic modern Yamaha dan lainnya. Memiliki formula yang sangat stabil terhadap temperatur tinggi, mengoptimalkan konsumsi BBM, serta bebas dari slip kopling kering.",
    specs: {
      "Base Oil": "Semi-Synthetic",
      "API Service": "SJ",
      "JASO Standard": "MB",
      "Engine Type": "4-Stroke Matic"
    }
  },
  {
    id: "p-002",
    slug: "v-belt-roller-kit-honda",
    name: "V-Belt & Roller Kit Honda",
    categorySlug: "tire",
    category: "Ban & Rantai",
    price: 135000,
    stock: 28,
    status: "available",
    badge: "Tersedia",
    sku: "VB-HB-2024",
    image: "/src/assets/images/v_belt_honda_beat_1780484763972.png",
    summary:
      "Paket V-Belt dan roller CVT original Honda Genuine Parts untuk transmisi halus dan bertenaga.",
    description:
      "Paket transmisi matic terdiri dari drive belt elastis berkualitas tinggi dan roller CVT presisi untuk motor matic Honda (BeAT, Scoopy, Vario). Tahan terhadap gesekan tinggi, mengurangi kebisingan boks CVT, dan mengembalikan akselerasi lincah sepeda motor Anda.",
    specs: {
      "Tipe Produk": "CVT Drive Kit",
      Material: "Karet EPDM premium & Tembaga presisi",
      Fungsi: "Transmisi daya roda belakang",
      Keunggulan: "Tahan gesekan, awet, tarikan enteng"
    }
  },
  {
    id: "p-003",
    slug: "busi-ngk-standar",
    name: "Busi NGK Standar C7HSA",
    categorySlug: "electric",
    category: "Kelistrikan",
    price: 25000,
    stock: 50,
    status: "available",
    badge: "Tersedia",
    sku: "SP-NGK-C7HSA",
    image: "/src/assets/images/busi_ngk_spark_1780484779013.png",
    summary:
      "Busi NGK orisinal Jepang berkualitas tinggi untuk pengapian stabil dan pembakaran efisien.",
    description:
      "Busi NGK standar C7HSA membantu menghasilkan percikan api optimal dan stabil di ruang bakar. Sangat handal digunakan harian untuk efisiensi bahan bakar lebih tinggi dan performa mesin optimal di semua RPM.",
    specs: {
      "Tipe Produk": "Busi Motor",
      "Tipe Ulir": "Matic & Bebek (C7HSA)",
      "Material Elektroda": "Nickel Alloy",
      Kondisi: "Baru & Original"
    }
  },
  {
    id: "p-004",
    slug: "ban-dalam-irc-premium",
    name: "Ban Dalam IRC Premium",
    categorySlug: "tire",
    category: "Ban & Rantai",
    price: 45000,
    stock: 45,
    status: "available",
    badge: "Tersedia",
    sku: "TR-IRC-14",
    image: "/src/assets/images/ban_dalam_irc_1780484791842.png",
    summary: "Ban dalam kualitas premium dari IRC untuk durabilitas tinggi dan tekanan ban stabil.",
    description:
      "Ban dalam motor IRC dibuat dari formulasi karet murni berkualitas tinggi (premium rubber) yang elastis dan tangguh terhadap tusukan objek tajam, menjaga kestabilan tekanan angin ban dalam perjalanan sehari-hari.",
    specs: {
      "Tipe Produk": "Ban Dalam",
      Ukuran: "14 / 17 Inch",
      Material: "Premium Rubber",
      Kondisi: "Baru & Original"
    }
  },
  {
    id: "p-005",
    slug: "rantai-gear-set-sss",
    name: "Rantai Gear Set SSS",
    categorySlug: "tire",
    category: "Ban & Rantai",
    price: 150000,
    stock: 25,
    status: "available",
    badge: "Tersedia",
    sku: "CH-SSS-420",
    image: "/products/rantai-gear-set-sss.jpg",
    summary:
      "Gear set berkualitas untuk perpindahan tenaga yang halus dan stabil.",
    description:
      "Rantai Gear Set SSS dibuat dari baja berkualitas untuk mendukung performa motor bebek maupun sport. Cocok untuk penggunaan harian dengan kebutuhan transmisi yang kuat dan stabil.",
    specs: {
      Tipe: "Gear Set",
      Material: "Baja berkualitas",
      Ukuran: "420 / 428",
      Kompatibilitas: "Motor bebek & sport"
    }
  },
  {
    id: "p-006",
    slug: "shock-breaker-kyb-z-series",
    name: "Shock Breaker KYB Z-Series",
    categorySlug: "engine",
    category: "Suku Cadang Mesin",
    price: 850000,
    stock: 12,
    status: "available",
    badge: "Tersedia",
    sku: "SB-KYB-Z",
    image: "/products/shock-breaker-kyb-z-series.jpg",
    summary:
      "Suspensi berkualitas untuk kenyamanan dan kestabilan berkendara.",
    description:
      "Shock Breaker KYB Z-Series dirancang untuk meredam getaran secara maksimal. Suspensi ini membantu meningkatkan stabilitas motor ketika digunakan pada jalan bergelombang maupun perjalanan jauh.",
    specs: {
      Tipe: "Shock Breaker",
      Series: "Z-Series",
      Fungsi: "Peredam getaran",
      Material: "Baja"
    }
  },
  {
    id: "p-007",
    slug: "aki-motor-gs-astra",
    name: "Aki Motor GS Astra",
    categorySlug: "electric",
    category: "Kelistrikan",
    price: 185000,
    stock: 18,
    status: "available",
    badge: "Tersedia",
    sku: "BT-GS-12V",
    image: "https://picsum.photos/seed/b-gs-12v/600/600",
    summary:
      "Aki kering berkualitas tinggi dan bebas perawatan untuk suplai listrik ekstra stabil dan awet.",
    description:
      "Aki Motor GS Astra berfungsi sebagai sumber daya listrik utama motor Anda. Dengan penutup anti-bocor, material grid timbal canggih, cocok untuk bepergian harian dalam kondisi cuaca ekstrem sekalipun.",
    specs: {
      "Tipe Produk": "Aki Motor Kering",
      Tegangan: "12 Volt",
      Kondisi: "Baru & Original"
    }
  },
  {
    id: "p-008",
    slug: "oli-rem-ahm",
    name: "Oli Rem AHM",
    categorySlug: "brake",
    category: "Pengereman",
    price: 45000,
    stock: 40,
    status: "available",
    badge: "Tersedia",
    sku: "BR-AHM-DOT4",
    image: "/products/oli-rem-ahm.jpg",
    summary: "Minyak rem standar DOT 4 untuk pengereman stabil.",
    description:
      "Oli Rem AHM membantu memastikan sistem pengereman bekerja responsif and stabil. Formulanya tahan terhadap suhu tinggi serta membantu melindungi komponen rem dari karat dan keausan.",
    specs: {
      Tipe: "Oli Rem",
      Brand: "AHM",
      Standard: "DOT 4",
      Volume: "±50 ml"
    }
  },
  {
    id: "p-009",
    slug: "ban-motor",
    name: "Ban Motor",
    categorySlug: "tire",
    category: "Ban & Rantai",
    price: 150000,
    stock: 32,
    status: "available",
    badge: "Tersedia",
    sku: "TR-TL-8090",
    image: "/products/ban-motor.jpg",
    summary: "Ban motor dengan daya cengkeram stabil untuk berbagai kondisi jalan.",
    description:
      "Ban motor ini dirancang dengan material berkualitas untuk memberikan performa optimal. Cocok digunakan pada kondisi jalan kering maupun basah dengan stabilitas berkendara yang baik.",
    specs: {
      "Tipe Ban": "Tubeless",
      Ring: "14 Inch",
      Material: "Compound Rubber",
      Ukuran: "80/90-14"
    }
  },
  {
    id: "p-010",
    slug: "lampu-motor-led",
    name: "Lampu Motor LED",
    categorySlug: "electric",
    category: "Kelistrikan",
    price: 20000,
    stock: 0,
    status: "soldout",
    badge: "Stok Habis",
    sku: "LED-MT-12V",
    image: "/products/lampu-motor-led.jpg",
    summary: "Lampu LED terang dan hemat daya untuk kendaraan harian.",
    description:
      "Lampu Motor LED memberikan pencahayaan lebih terang dengan konsumsi daya rendah. Produk ini cocok untuk meningkatkan visibilitas saat berkendara pada malam hari.",
    specs: {
      Tipe: "Lampu Motor",
      "Jenis Lampu": "LED",
      Tegangan: "12 Volt",
      Ketahanan: "Tahan panas"
    }
  }
];

export const activityLogs: ActivityLog[] = [
  {
    title: 'Produk Baru: "Knalpot Akrapovic Ninja 250"',
    description: "Ditambahkan oleh Admin 2 jam yang lalu",
    status: "Berhasil"
  },
  {
    title: 'Klik WhatsApp: "Shock Breaker KYB Z-Series"',
    description: "Customer ID #8812 mengalihkan ke chat",
    status: "15:30 WIB"
  },
  {
    title: 'Peringatan Stok: "Busi NGK Standar"',
    description: "Sisa stok tinggal 0 unit (Habis)",
    status: "Penting"
  }
];

export const whatsappChart: ChartData[] = [
  { day: "Sen", orders: 12 },
  { day: "Sel", orders: 20 },
  { day: "Rab", orders: 28 },
  { day: "Kam", orders: 36 },
  { day: "Jum", orders: 26 },
  { day: "Sab", orders: 14 }
];
