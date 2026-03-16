import { Router } from "express";
import { briefingQueue } from "../../scheduler/queue";
import { pool } from "../../db/queries";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";
import { runBriefingPipeline } from "../../agents/orchestrator";

export const briefingsRouter = Router();

briefingsRouter.post("/trigger", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const mode = (req.body?.mode ?? "morning") as "morning" | "evening" | "weekly" | "alert";
  const result = await runBriefingPipeline(userId, mode);
  res.json(result);
});

briefingsRouter.post("/enqueue", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const mode = (req.body?.mode ?? "morning") as "morning" | "evening" | "weekly" | "alert";
  const job = await briefingQueue.add(mode, { userId, mode });
  res.json({ jobId: job.id });
});

briefingsRouter.get("/history", requireAuth, async (req: AuthenticatedRequest, res) => {
  const result = await pool.query(
    `SELECT id, mode, script, audio_url AS "audioUrl", delivery_status AS "deliveryStatus", delivered_at AS "deliveredAt", created_at AS "createdAt"
     FROM briefings
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.user!.id]
  );
  res.json(result.rows);
});
