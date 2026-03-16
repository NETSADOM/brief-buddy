import { briefingQueue } from "./queue";

export async function registerUrgencyWatcherJob(): Promise<void> {
  await briefingQueue.upsertJobScheduler(
    "urgency-watcher-scheduler",
    { every: 15 * 60 * 1000 },
    {
      name: "urgency-watcher",
      data: { mode: "alert" }
    }
  );
}
