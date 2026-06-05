import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DashboardSummary,
  fetchDashboardSummary,
} from "../services/dashboardService";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardSummary>({
    totalProducts: 0,
    outOfStockProducts: 0,
    whatsappQuestions: 0,
    whatsappChart: [],
    activities: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const data = await fetchDashboardSummary();
      setDashboard(data);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-[#171514] px-6 py-8 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Dashboard Monitoring
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Pantau statistik ketersediaan produk dan interaksi pelanggan secara
          real-time.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-[#111] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
            Total Katalog Produk
          </p>
          <h2 className="mt-4 text-4xl font-black text-orange-600">
            {loading ? "..." : dashboard.totalProducts}
          </h2>
          <p className="mt-3 text-xs text-zinc-500">Item suku cadang terdata</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
            Kehabisan Stok
          </p>
          <h2 className="mt-4 text-4xl font-black text-orange-600">
            {loading ? "..." : dashboard.outOfStockProducts}
          </h2>
          <p className="mt-3 text-xs text-zinc-500">Perlu segera restock/order</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
            Pertanyaan via WA
          </p>
          <h2 className="mt-4 text-4xl font-black text-orange-600">
            {loading ? "..." : dashboard.whatsappQuestions}
          </h2>
          <p className="mt-3 text-xs text-zinc-500">Total data dari Supabase</p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-2xl border border-zinc-800 bg-[#111] p-6">
          <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-black uppercase tracking-wider">
              Statistik Klik Tombol WhatsApp
            </h2>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
              Live
            </span>
          </div>

          {dashboard.whatsappChart.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center">
              <div>
                <p className="font-bold text-zinc-300">
                  Belum ada data statistik WhatsApp
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Data akan muncul setelah tabel whatsapp_stats terisi.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.whatsappChart}>
                  <XAxis dataKey="day" stroke="#777" />
                  <YAxis stroke="#777" />
                  <Tooltip
                    contentStyle={{
                      background: "#171514",
                      border: "1px solid #333",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#ff4b1f"
                    fill="#ff4b1f"
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111] p-6">
          <h2 className="mb-6 border-b border-zinc-800 pb-4 text-sm font-black uppercase tracking-wider">
            Aktivitas Terkini
          </h2>

          {dashboard.activities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center">
              <p className="font-bold text-zinc-300">Belum ada aktivitas</p>
              <p className="mt-2 text-sm text-zinc-500">
                Data akan muncul setelah tabel activity_logs terisi.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="rounded-xl border border-zinc-800 bg-[#171514] p-4"
                >
                  <div className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-200 text-sm font-black text-zinc-900">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {activity.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {activity.description}
                      </p>
                      {activity.status && (
                        <p className="mt-3 text-xs font-bold uppercase text-orange-400">
                          {activity.status}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
