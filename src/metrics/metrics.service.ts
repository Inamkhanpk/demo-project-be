import { Injectable } from "@nestjs/common";
import { addDays } from "date-fns";
import { computeRange, daysInRange } from "../common/helper";
import { RangeKey, DataPoint } from "../common/types";
import { synthData } from "../common/helper";
import { CACHE_TTL_MS, cache } from "../common/constant";
// ---- Metrics Service ----
@Injectable()
export class MetricsService {
  getMetrics(range: RangeKey, from?: string, to?: string) {
    const key = JSON.stringify({ range, from, to });
    const now = Date.now();

    // Cache lookup
    const hit = cache.get(key);
    if (hit && now - hit.ts < CACHE_TTL_MS) return hit.data;

    const { from: f, to: t } = computeRange(range, from, to);
    const days = daysInRange(f, t);

    let points: DataPoint[];

    if (range === "DAILY") {
      points = days.flatMap((d) => synthData(d, "daily"));
    } else {
      points = days.map((d) => synthData(d, "daily")[0]);

      if (range === "YTD") {
        const byMonth = new Map<
          string,
          { revenue: number; expenses: number; profit: number; count: number }
        >();

        for (const p of points) {
          const monthKey = p.date.slice(0, 7) + "-01";
          const agg = byMonth.get(monthKey) || {
            revenue: 0,
            expenses: 0,
            profit: 0,
            count: 0,
          };
          agg.revenue += p.revenue;
          agg.expenses += p.expenses;
          agg.profit += p.profit;
          agg.count++;
          byMonth.set(monthKey, agg);
        }

        points = Array.from(byMonth.entries()).map(([k, v]) => ({
          date: k,
          revenue: Math.round(v.revenue / v.count),
          expenses: Math.round(v.expenses / v.count),
          profit: Math.round(v.profit / v.count),
        }));
      }
    }

    // ---- Summary ----
    const sum = (key: keyof DataPoint) =>
      points.reduce(
        (s, p) => s + (typeof p[key] === "number" ? (p[key] as number) : 0),
        0,
      );
    const periodProfit = sum("profit");

    const lastYearDaily = days.map(
      (d) => synthData(addDays(d, -365), "daily")[0],
    );
    const lastYearSamePeriodProfit = lastYearDaily.reduce(
      (s, p) => s + p.profit,
      0,
    );

    // ---- Notification ----
    let notification: {
      type: "success" | "warning" | null;
      message: string | null;
    } = {
      type: null,
      message: null,
    };

    if (lastYearSamePeriodProfit > 0) {
      const diffPct =
        ((periodProfit - lastYearSamePeriodProfit) / lastYearSamePeriodProfit) *
        100;

      if (diffPct <= -20) {
        notification = {
          type: "warning",
          message: `⚠️ Profit dropped by ${Math.abs(diffPct).toFixed(1)}% compared to last year`,
        };
      } else if (diffPct >= 15) {
        notification = {
          type: "success",
          message: `✅ Profit increased by ${diffPct.toFixed(1)}% compared to last year`,
        };
      }
    }

    // ---- Final Result ----
    const data = {
      points,
      summary: {
        periodRevenue: sum("revenue"),
        periodExpenses: sum("expenses"),
        periodProfit,
        lastYearSamePeriodProfit,
      },
      notification,
    };

    cache.set(key, { ts: now, data });
    return data;
  }
}
