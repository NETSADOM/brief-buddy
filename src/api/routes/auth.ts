import { Router } from "express";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { seedDemoUser, upsertIntegration } from "../../db/queries";

export const authRouter = Router();

authRouter.get("/demo-token", async (_req, res) => {
  const userId = await seedDemoUser();
  const token = jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, userId });
});

authRouter.get("/google/start", (req, res) => {
  const userId = String(req.query.userId ?? "");
  if (!userId) {
    res.status(400).json({ error: "Missing userId query param" });
    return;
  }
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.status(400).json({ error: "Google OAuth env vars not configured" });
    return;
  }

  const redirectUri = env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/google/callback";
  const oauth2Client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar.readonly"
    ],
    state: userId
  });
  res.redirect(url);
});

authRouter.get("/google/callback", async (req, res) => {
  const code = String(req.query.code ?? "");
  const userId = String(req.query.state ?? "");
  if (!code || !userId) {
    res.status(400).json({ error: "Missing code/state in callback" });
    return;
  }
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.status(400).json({ error: "Google OAuth env vars not configured" });
    return;
  }

  const redirectUri = env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/google/callback";
  const oauth2Client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
  const tokenResponse = await oauth2Client.getToken(code);
  const credentials = tokenResponse.tokens;
  if (!credentials.access_token) {
    res.status(400).json({ error: "Google token exchange failed" });
    return;
  }

  await upsertIntegration({
    userId,
    provider: "google",
    accessToken: credentials.access_token,
    refreshToken: credentials.refresh_token ?? null,
    expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null
  });

  res.json({ connected: true, provider: "google" });
});

authRouter.get("/slack/start", (req, res) => {
  const userId = String(req.query.userId ?? "");
  if (!userId) {
    res.status(400).json({ error: "Missing userId query param" });
    return;
  }
  if (!env.SLACK_CLIENT_ID || !env.SLACK_CLIENT_SECRET) {
    res.status(400).json({ error: "Slack OAuth env vars not configured" });
    return;
  }

  const redirectUri = env.SLACK_REDIRECT_URI ?? "http://localhost:3000/api/auth/slack/callback";
  const scope = [
    "channels:history",
    "groups:history",
    "im:history",
    "users:read",
    "channels:read",
    "groups:read",
    "im:read"
  ].join(",");

  const url = `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(env.SLACK_CLIENT_ID)}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(userId)}`;
  res.redirect(url);
});

authRouter.get("/slack/callback", async (req, res) => {
  const code = String(req.query.code ?? "");
  const userId = String(req.query.state ?? "");
  if (!code || !userId) {
    res.status(400).json({ error: "Missing code/state in callback" });
    return;
  }
  if (!env.SLACK_CLIENT_ID || !env.SLACK_CLIENT_SECRET) {
    res.status(400).json({ error: "Slack OAuth env vars not configured" });
    return;
  }

  const redirectUri = env.SLACK_REDIRECT_URI ?? "http://localhost:3000/api/auth/slack/callback";
  const params = new URLSearchParams({
    code,
    client_id: env.SLACK_CLIENT_ID,
    client_secret: env.SLACK_CLIENT_SECRET,
    redirect_uri: redirectUri
  });
  const response = await axios.post("https://slack.com/api/oauth.v2.access", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  if (!response.data?.ok || !response.data?.access_token) {
    res.status(400).json({ error: "Slack token exchange failed", detail: response.data });
    return;
  }

  const expiresAt =
    typeof response.data.expires_in === "number"
      ? new Date(Date.now() + response.data.expires_in * 1000)
      : null;

  await upsertIntegration({
    userId,
    provider: "slack",
    accessToken: String(response.data.access_token),
    refreshToken: response.data.refresh_token ? String(response.data.refresh_token) : null,
    expiresAt
  });

  res.json({ connected: true, provider: "slack" });
});
