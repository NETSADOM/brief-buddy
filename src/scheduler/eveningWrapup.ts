import { briefingQueue } from "./queue";
import { listUserIds } from "../db/queries";

export async function registerEveningWrapupJob(): Promise<void> {
  const userIds = await listUserIds();
  await Promise.all(
    userIds.map((userId) =>
      briefingQueue.upsertJobScheduler(
        `evening-wrapup-${userId}`,
        { pattern: "0 18 * * 1-5" },
        {
          name: "evening-wrapup",
          data: { userId, mode: "evening" }
        }
      )
    )
  );
}
