import { Controller, Query, Sse } from "@nestjs/common";
import { interval, map } from "rxjs";
import { AlertsService } from "./alerts.service";

@Controller("alerts")
export class AlertsController {
  constructor(private alerts: AlertsService) {}

  @Sse("stream")
  stream(
    @Query("range") range: any,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    // emit every 5s
    return interval(5000).pipe(
      map(() => ({ data: this.alerts.buildAlert(range, from, to) })),
    );
  }
}
