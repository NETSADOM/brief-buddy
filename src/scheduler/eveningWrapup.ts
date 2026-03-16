import { briefingQueue } from "./queue";

export async function registerEveningWrapupJob(): Promise<void> {
  await briefingQueue.upsertJobScheduler(
    "evening-wrapup-scheduler",
    { pattern: "0 18 * * 1-5" },
    {
      name: "evening-wrapup",
      data: { mode: "evening" }
    }
  );
}
