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

    // 2. Fetch whatsapp click statistics (total count of entries from whatsapp_clicks)
    try {
      const { count, error: countErr } = await supabase
        .from("whatsapp_clicks")
        .select("*", { count: "exact", head: true });

      if (countErr) {
        console.warn("Could not count 'whatsapp_clicks' table for summary:", countErr.message);
      } else {
        summary.whatsappQuestions = count || 0;
      }

      // Generate timeline for last 7 days (day-6 to today)
      const chartData: { day: string; orders: number; dateStr: string }[] = [];
      const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = daysOfWeek[d.getDay()];
        const dateFormatted = d.toLocaleDateString("id-ID", { day: "numeric", month: "numeric" });
        
        // Local YYYY-MM-DD to avoid timezone shifting issues
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const date = String(d.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${date}`;

        chartData.push({
          day: `${dayLabel} (${dateFormatted})`,
          orders: 0,
          dateStr
        });
      }

      // Query whatsapp_clicks from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: clicksData, error: clicksErr } = await supabase
        .from("whatsapp_clicks")
        .select("created_at")
        .gte("created_at", sevenDaysAgo.toISOString());

      if (clicksErr) {
        console.warn("Could not query 'whatsapp_clicks' for chart:", clicksErr.message);
      } else if (clicksData) {
        clicksData.forEach((click: any) => {
          if (click.created_at) {
            const clickDate = new Date(click.created_at);
            const y = clickDate.getFullYear();
            const m = String(clickDate.getMonth() + 1).padStart(2, "0");
            const d = String(clickDate.getDate()).padStart(2, "0");
            const clickDateStr = `${y}-${m}-${d}`;
            
            const matchIndex = chartData.find((c) => c.dateStr === clickDateStr);
            if (matchIndex) {
              matchIndex.orders++;
            }
          }
        });
      }

      summary.whatsappChart = chartData.map(({ day, orders }) => ({ day, orders }));
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
