import { Router } from "express";
import { z } from "zod";
import { pool, getUserSettings, getIntegrationsStatus } from "../../db/queries";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

export const settingsRouter = Router();
settingsRouter.use(requireAuth);
const settingsPatchSchema = z.object({
  morningTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  eveningTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  newsKeywords: z.array(z.string()).optional(),
  dealValueThreshold: z.number().nonnegative().optional(),
  urgencyKeywords: z.array(z.string()).optional()
});

settingsRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const settings = await getUserSettings(req.user!.id);
  res.json(settings);
});

settingsRouter.get("/integrations", async (req: AuthenticatedRequest, res) => {
  const statuses = await getIntegrationsStatus(req.user!.id);
  res.json(statuses);
});

settingsRouter.patch("/", async (req: AuthenticatedRequest, res) => {
  const parsed = settingsPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid settings payload" });
    return;
  }

  await pool.query(
    `UPDATE settings
        SET morning_time = COALESCE($2, morning_time),
            evening_time = COALESCE($3, evening_time),
            news_keywords = COALESCE($4, news_keywords),
            deal_value_threshold = COALESCE($5, deal_value_threshold),
            urgency_keywords = COALESCE($6, urgency_keywords),
            updated_at = NOW()
      WHERE user_id = $1`,
    [
      req.user!.id,
      parsed.data.morningTime ?? null,
      parsed.data.eveningTime ?? null,
      parsed.data.newsKeywords ?? null,
      parsed.data.dealValueThreshold ?? null,
      parsed.data.urgencyKeywords ?? null
    ]
  );
  const settings = await getUserSettings(req.user!.id);
  res.json(settings);
});
