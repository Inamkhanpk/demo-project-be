import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { MetricsService } from "./metrics.service";
import { RangeKey } from "../common/types";

@Controller("metrics")
export class MetricsController {
  constructor(private svc: MetricsService) {}

  @Get()
  getMetrics(
    @Query("range") range: any,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const r = (range || "YTD") as RangeKey;
    return this.svc.getMetrics(r, from, to);
  }

  @Get("csv")
  getCsv(
    @Query("range") range: any,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Res() res?: Response, // made optional to fix parameter order error
  ) {
    const r = (range || "YTD") as RangeKey;
    const { points } = this.svc.getMetrics(r, from, to);

    const header = "date,revenue,expenses,profit";
    console.log("points", points);
    const rows = points.map(
      (p: any) => `${p.date},${p.revenue},${p.expenses},${p.profit}`,
    );
    const csv = [header, ...rows].join("\n");

    if (res) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="metrics.csv"',
      );
      res.send(csv);
    }
  }
}
