import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { initializeDatabase } from "./db/init";
import { seedDemoUser } from "./db/queries";
import { authRouter } from "./api/routes/auth";
import { briefingsRouter } from "./api/routes/briefings";
import { tasksRouter } from "./api/routes/tasks";
import { settingsRouter } from "./api/routes/settings";
import { voiceRouter } from "./api/routes/voice";
import { registerMorningBriefingJob } from "./scheduler/morningBriefing";
import { registerEveningWrapupJob } from "./scheduler/eveningWrapup";
import { registerWeeklyRecapJob } from "./scheduler/weeklyRecap";
import { registerUrgencyWatcherJob } from "./scheduler/urgencyWatcher";
import { createBriefingWorker } from "./scheduler/worker";

async function bootstrap(): Promise<void> {
  await initializeDatabase();
  const demoUserId = await seedDemoUser();

  await Promise.all([
    registerMorningBriefingJob(),
    registerEveningWrapupJob(),
    registerWeeklyRecapJob(),
    registerUrgencyWatcherJob()
  ]);

  const worker = createBriefingWorker(demoUserId);
  worker.on("failed", (job, err) => {
    console.error(`Worker failed for job ${job?.id}:`, err.message);
  });

  const app = express();
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/briefings", briefingsRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/voice", voiceRouter);

  if (env.NODE_ENV === "production") {
    const frontendDir = path.join(process.cwd(), "frontend", "dist");
    app.use(express.static(frontendDir));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(frontendDir, "index.html"));
    });
  }

  app.listen(env.PORT, () => {
    console.log(`VoiceBrief API listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Fatal startup error:", error);
  process.exit(1);
});
