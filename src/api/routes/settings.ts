import { Router } from "express";
import { pool, getUserSettings, getIntegrationsStatus } from "../../db/queries";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

settingsRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const settings = await getUserSettings(req.user!.id);
  res.json(settings);
});

settingsRouter.get("/integrations", async (req: AuthenticatedRequest, res) => {
  const statuses = await getIntegrationsStatus(req.user!.id);
  res.json(statuses);
});

settingsRouter.patch("/", async (req: AuthenticatedRequest, res) => {
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
      req.body.morningTime ?? null,
      req.body.eveningTime ?? null,
      req.body.newsKeywords ?? null,
      req.body.dealValueThreshold ?? null,
      req.body.urgencyKeywords ?? null
    ]
  );
  const settings = await getUserSettings(req.user!.id);
  res.json(settings);
});
