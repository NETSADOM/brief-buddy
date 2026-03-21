import { Worker } from "bullmq";
import { runBriefingPipeline } from "../agents/orchestrator";
import { redisConnection } from "./queue";

export function createBriefingWorker(): Worker {
  return new Worker(
    "briefings",
    async (job) => {
      const userId = job.data?.userId as string | undefined;
      if (!userId) {
        throw new Error("Missing userId in briefing job payload");
      }
      const mode = (job.data?.mode as "morning" | "evening" | "weekly" | "alert" | undefined) ?? "morning";
      await runBriefingPipeline(userId, mode);
    },
    { connection: redisConnection }
  );
}
