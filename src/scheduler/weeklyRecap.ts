import { briefingQueue } from "./queue";
import { listUserIds } from "../db/queries";

export async function registerWeeklyRecapJob(): Promise<void> {
  const userIds = await listUserIds();
  await Promise.all(
    userIds.map((userId) =>
      briefingQueue.upsertJobScheduler(
        `weekly-recap-${userId}`,
        { pattern: "0 17 * * 5" },
        {
          name: "weekly-recap",
          data: { userId, mode: "weekly" }
        }
      )
    )
  );
}
