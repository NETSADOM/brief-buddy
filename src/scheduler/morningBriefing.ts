import { briefingQueue } from "./queue";
import { listUserIds } from "../db/queries";

export async function registerMorningBriefingJob(): Promise<void> {
  const userIds = await listUserIds();
  await Promise.all(
    userIds.map((userId) =>
      briefingQueue.upsertJobScheduler(
        `morning-briefing-${userId}`,
        { pattern: "0 7 * * *" },
        {
          name: "morning-briefing",
          data: { userId, mode: "morning" }
        }
      )
    )
  );
}
