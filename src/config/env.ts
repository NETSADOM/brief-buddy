import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  BASE_URL: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  // LLM providers
  OLLAMA_BASE_URL: z.string().optional(), // e.g. http://localhost:11434
  OLLAMA_MODEL: z.string().optional(),    // e.g. llama3.2
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  SLACK_CLIENT_ID: z.string().optional(),
  SLACK_CLIENT_SECRET: z.string().optional(),
  SLACK_REDIRECT_URI: z.string().optional(),
  HUBSPOT_API_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  throw new Error(`Invalid environment configuration:\n${missing.join("\n")}`);
}

if (parsed.data.NODE_ENV === "production") {
  if (!parsed.data.BASE_URL) {
    throw new Error("Invalid environment configuration:\nBASE_URL is required in production");
  }
  if (parsed.data.JWT_SECRET.length < 16 || parsed.data.JWT_SECRET === "change-me") {
    throw new Error("Invalid environment configuration:\nJWT_SECRET must be strong in production");
  }
}

export const env = parsed.data;
