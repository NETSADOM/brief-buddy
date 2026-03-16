import { Client } from "@hubspot/api-client";
import { CrmDeal } from "../types/briefing";
import { env } from "../config/env";
import { withFallback, withTimeout } from "../utils/timeouts";

const STAGES = new Set(["proposal sent", "negotiation", "closing"]);

export async function fetchCrmDeals(): Promise<CrmDeal[]> {
  return withFallback(
    () =>
      withTimeout(
        (async () => {
          if (!env.HUBSPOT_API_KEY) return [];
          const client = new Client({ accessToken: env.HUBSPOT_API_KEY });

          const pipelineResponse = await client.crm.pipelines.pipelinesApi.getAll("deals");
          const stageMap = new Map<string, string>();
          for (const pipeline of pipelineResponse.results ?? []) {
            for (const stage of pipeline.stages ?? []) {
              if (stage.id && stage.label) {
                stageMap.set(stage.id, stage.label.toLowerCase());
              }
            }
          }

          const page = await client.crm.deals.basicApi.getPage(100, undefined, [
            "dealname",
            "dealstage",
            "amount",
            "hs_lastactivitydate",
            "hs_lastmodifieddate"
          ]);
          const now = Date.now();

          return (page.results ?? [])
            .map((deal) => {
              const rawStage = deal.properties?.dealstage ?? "";
              const stage = (stageMap.get(rawStage) ?? rawStage).toLowerCase();
              const value = Number(deal.properties?.amount ?? 0);
              const lastActivity = Number(deal.properties?.hs_lastactivitydate ?? deal.properties?.hs_lastmodifieddate ?? now);
              const safeLastActivity = Number.isFinite(lastActivity) ? lastActivity : now;
              const daysSinceActivity = Math.floor((now - safeLastActivity) / (1000 * 60 * 60 * 24));
              return {
                dealName: deal.properties?.dealname ?? "Unnamed deal",
                stage,
                value,
                contactName: "Unknown contact",
                daysSinceActivity
              };
            })
            .filter((d) => STAGES.has(d.stage));
        })(),
        10_000,
        "crm-agent"
      ),
    [],
    "crm-agent"
  );
}
