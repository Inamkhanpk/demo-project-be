import { Injectable } from "@nestjs/common";
import { MetricsService } from "../metrics/metrics.service";

@Injectable()
export class AlertsService {
  constructor(private metrics: MetricsService) {}

  buildAlert(range: any, from?: string, to?: string) {
    const { summary } = this.metrics.getMetrics(range, from, to);
    const diff = summary.periodProfit - summary.lastYearSamePeriodProfit;
    const pct =
      summary.lastYearSamePeriodProfit === 0
        ? 0
        : (diff / summary.lastYearSamePeriodProfit) * 100;

    if (pct <= -20)
      return {
        level: "warning",
        message: `Profit down ${pct.toFixed(1)}% vs same period last year.`,
      };
    if (pct >= 15)
      return {
        level: "success",
        message: `Profit up ${pct.toFixed(1)}% vs same period last year.`,
      };
    return {
      level: "info",
      message: `Profit ${pct >= 0 ? "up" : "down"} ${pct.toFixed(1)}% vs LY.`,
    };
  }
}
