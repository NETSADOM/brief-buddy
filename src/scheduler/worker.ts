import { Worker } from "bullmq";
import { runBriefingPipeline } from "../agents/orchestrator";
import { redisConnection } from "./queue";

export function createBriefingWorker(defaultUserId: string): Worker {
  return new Worker(
    "briefings",
    async (job) => {
      const userId = (job.data?.userId as string | undefined) ?? defaultUserId;
      const mode = (job.data?.mode as "morning" | "evening" | "weekly" | "alert" | undefined) ?? "morning";
      await runBriefingPipeline(userId, mode);
    },
    { connection: redisConnection }
  );
}
