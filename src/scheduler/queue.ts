import { Queue } from "bullmq";
import { env } from "../config/env";

export const redisConnection = {
  url: env.REDIS_URL
};

export type BriefingJobName = "morning-briefing" | "evening-wrapup" | "weekly-recap" | "urgency-watcher";

export const briefingQueue = new Queue("briefings", {
  connection: redisConnection
});
