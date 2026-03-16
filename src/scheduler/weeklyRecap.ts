import { briefingQueue } from "./queue";

export async function registerWeeklyRecapJob(): Promise<void> {
  await briefingQueue.upsertJobScheduler(
    "weekly-recap-scheduler",
    { pattern: "0 17 * * 5" },
    {
      name: "weekly-recap",
      data: { mode: "weekly" }
    }
  );
}
