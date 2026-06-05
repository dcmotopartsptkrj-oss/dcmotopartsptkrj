import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export interface WhatsappStat {
  day: string;
  orders: number;
}

export interface ActivityLog {
  id: string | number;
  title: string;
  description: string;
  status?: string;
}

export interface DashboardSummary {
  totalProducts: number;
  outOfStockProducts: number;
  whatsappQuestions: number;
  whatsappChart: WhatsappStat[];
  activities: ActivityLog[];
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const defaultSummary: DashboardSummary = {
    totalProducts: 0,
    outOfStockProducts: 0,
    whatsappQuestions: 0,
    whatsappChart: [],
    activities: [],
  };

  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase is not configured. Returning empty dashboard stats.");
    return defaultSummary;
  }

  try {
    const summary: DashboardSummary = { ...defaultSummary };

    // 1. Fetch products statistics
    try {
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("stock, status");

      if (prodErr) {
        console.warn("Could not query 'products' table for summary:", prodErr.message);
      } else if (prodData) {
        summary.totalProducts = prodData.length;
        summary.outOfStockProducts = prodData.filter(
          (p) => Number(p.stock) === 0 || p.status === "soldout"
        ).length;
      }
    } catch (e) {
      console.error("Error fetching products for dashboard summary:", e);
    }

    // 2. Fetch whatsapp click statistics
    try {
      const { data: waData, error: waErr } = await supabase
        .from("whatsapp_stats")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(30);

      if (waErr) {
        console.warn("Could not query 'whatsapp_stats' table for summary:", waErr.message);
      } else if (waData) {
        summary.whatsappChart = waData.map((row: any) => ({
          day: row.day || row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString() : "Day"),
          orders: Number(row.orders ?? row.clicks ?? row.click_count ?? row.count ?? 0),
        }));

        // Calculate total whatsapp questions (sum of clicks/orders or number of logs)
        const totalClicks = summary.whatsappChart.reduce((sum, item) => sum + item.orders, 0);
        summary.whatsappQuestions = totalClicks > 0 ? totalClicks : waData.length;
      }
    } catch (e) {
      console.error("Error fetching whatsapp stats for dashboard summary:", e);
    }

    // 3. Fetch activity logs
    try {
      const { data: actData, error: actErr } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (actErr) {
        console.warn("Could not query 'activity_logs' table for summary:", actErr.message);
      } else if (actData) {
        summary.activities = actData.map((row: any) => ({
          id: row.id,
          title: row.title || row.activity || "Aktivitas",
          description: row.description || row.details || row.message || "",
          status: row.status || "",
        }));
      }
    } catch (e) {
      console.error("Error fetching activity logs for dashboard summary:", e);
    }

    return summary;
  } catch (err) {
    console.error("Failed to fetch dashboard summary:", err);
    return defaultSummary;
  }
}
