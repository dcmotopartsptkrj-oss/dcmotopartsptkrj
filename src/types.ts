export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  category: string;
  price: number;
  stock: number;
  status: "available" | "soldout";
  badge: string;
  sku: string;
  image: string;
  imagePath?: string;
  summary: string;
  description: string;
  specs: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  label: string;
  icon: string;
}

export interface Store {
  name: string;
  whatsapp: string;
  address: string;
  workDays: string;
  workHours: string;
  maps: string;
  description: string;
}

export interface ActivityLog {
  title: string;
  description: string;
  status: string;
}

export interface ChartData {
  day: string;
  orders: number;
}
