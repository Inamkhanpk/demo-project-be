import { Module } from "@nestjs/common";
import { MetricsController } from "./metrics/metrics.controller";
import { MetricsService } from "./metrics/metrics.service";
import { AlertsController } from "./alerts/alerts.controller";
import { AlertsService } from "./alerts/alerts.service";
import { AuthController } from "./auth/auth.controller";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes config available everywhere
      envFilePath: ".env", // default is ".env", so this is optional
    }),
  ],
  controllers: [MetricsController, AlertsController, AuthController],
  providers: [MetricsService, AlertsService],
})
export class AppModule {}
