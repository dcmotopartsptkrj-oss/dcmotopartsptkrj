import { BarChart, Grid, Package, PhoneCall, TrendingUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import StatCard from "../components/StatCard";
import { activityLogs, defaultProducts, whatsappChart } from "../data/products";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Product } from "../types";
import { isSupabaseConfigured, fetchProductsFromSupabase } from "../lib/supabaseClient";

export default function AdminDashboard() {
  const [localProducts] = useLocalStorage<Product[]>("dc_products", defaultProducts);
  const [products, setProducts] = useState<Product[]>(localProducts);

  useEffect(() => {
    async function loadDashboardProducts() {
      if (isSupabaseConfigured) {
        try {
          const dbProducts = await fetchProductsFromSupabase();
          if (dbProducts && dbProducts.length > 0) {
            setProducts(dbProducts);
          }
        } catch (err) {
          console.warn("Gagal memuat produk di dashboard:", err);
        }
      }
    }
    loadDashboardProducts();
  }, []);

  // Compute stats metrics dynamically
  const stats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => p.status === "soldout").length;
    const totalStockVal = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    return {
      total,
      outOfStock,
      totalStockVal
    };
  }, [products]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 font-sans">
      {/* Welcome header */}
      <div>
        <h2 className="text-2xl font-black uppercase text-white">Dashboard Monitoring</h2>
        <p className="text-zinc-500 mt-1 text-sm font-medium">
          Pantau statistik ketersediaan produk dan interaksi pelanggan secara real-time.
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Katalog Produk"
          value={stats.total}
          note="Item suku cadang terdata"
          icon={<Package size={24} />}
        />
        <StatCard
          label="Kehabisan Stok"
          value={stats.outOfStock}
          note="Perlu segera restock/order"
          icon={<Grid size={24} />}
        />
        <StatCard
          label="Pertanyaan via WA"
          value={134} // mock interactive stats
          note="+12% peningkatan minggu ini"
          icon={<PhoneCall size={24} />}
        />
      </div>

      {/* Recharts chart & Logs section */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Chart */}
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-line">
            <div className="flex items-center gap-2">
              <BarChart size={18} className="text-peach" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-100">
                Statistik Klik Tombol WhatsApp (7 Hari Terakhir)
              </h3>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 uppercase tracking-widest leading-none">
              <TrendingUp size={10} /> Live
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={whatsappChart}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4b1f" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ff4b1f" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2928" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#a7a0a0" 
                  style={{ fontSize: 11, fontWeight: "600" }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#a7a0a0" 
                  style={{ fontSize: 11, fontWeight: "600" }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171514",
                    border: "1px solid #332c29",
                    borderRadius: "12px",
                    fontFamily: "Montserrat, sans-serif"
                  }}
                  itemStyle={{ color: "#ffb3aa", fontSize: "12px", fontWeight: "bold" }}
                  labelStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                  labelFormatter={(label) => `Hari: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#ff4b1f"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Logs */}
        <div className="panel p-6 h-fit">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-100 pb-4 border-b border-line mb-6">
            Aktivitas Terkini
          </h3>

          <div className="space-y-5">
            {activityLogs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl border border-line bg-panel-soft/30"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-peach text-xs font-black text-night font-sans">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white leading-normal">
                    {log.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-zinc-500">
                    {log.description}
                  </p>
                  <span className="inline-block mt-2 rounded bg-ember/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-peach">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
