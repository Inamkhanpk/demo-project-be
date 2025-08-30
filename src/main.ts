import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Middleware
  app.use(cookieParser());

  // CORS setup
  const corsOrigins = configService.get<number>("CORS_ORIGIN") || [
    "http://localhost:3000",
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  // Port setup
  const port = configService.get<number>("BACKEND_PORT") || 4000;

  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

bootstrap();
