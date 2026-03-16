import { briefingQueue } from "./queue";

export async function registerMorningBriefingJob(): Promise<void> {
  await briefingQueue.upsertJobScheduler(
    "morning-briefing-scheduler",
    { pattern: "0 7 * * *" },
    {
      name: "morning-briefing",
      data: { mode: "morning" }
    }
  );
}
