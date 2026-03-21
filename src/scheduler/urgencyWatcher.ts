import { briefingQueue } from "./queue";
import { listUserIds } from "../db/queries";

export async function registerUrgencyWatcherJob(): Promise<void> {
  const userIds = await listUserIds();
  await Promise.all(
    userIds.map((userId) =>
      briefingQueue.upsertJobScheduler(
        `urgency-watcher-${userId}`,
        { every: 15 * 60 * 1000 },
        {
          name: "urgency-watcher",
          data: { userId, mode: "alert" }
        }
      )
    )
  );
}
