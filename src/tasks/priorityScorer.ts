import dayjs from "dayjs";
import {
  BriefingPayload,
  CalendarEvent,
  CrmDeal,
  EmailInsight,
  ScoredItem,
  SlackMessage
} from "../types/briefing";

function emailToScore(email: EmailInsight): ScoredItem {
  const priority = email.urgencyScore >= 8 ? "CRITICAL" : email.urgencyScore >= 6 ? "HIGH" : email.urgencyScore >= 3 ? "NORMAL" : "FYI";
  return {
    source: "email",
    priority,
    score: email.urgencyScore,
    detail: `${email.sender}: ${email.subject}`
  };
}

function crmToScore(deal: CrmDeal, valueThreshold: number, staleDays: number): ScoredItem {
  const isCritical = deal.daysSinceActivity > staleDays && deal.value > valueThreshold;
  const score = isCritical ? 10 : Math.min(9, Math.floor(deal.value / 5000) + (deal.daysSinceActivity > staleDays ? 2 : 0));
  return {
    source: "crm",
    priority: isCritical ? "CRITICAL" : score >= 7 ? "HIGH" : "NORMAL",
    score,
    detail: `${deal.dealName} (${deal.stage})`
  };
}

function calendarToScore(events: CalendarEvent[]): ScoredItem[] {
  if (events.length === 0) return [];
  const scores: ScoredItem[] = [];
  const nowPlusHour = dayjs().add(1, "hour");
  const firstTime = dayjs(events[0].time);
  if (firstTime.isValid() && firstTime.isBefore(nowPlusHour)) {
    scores.push({
      source: "calendar",
      priority: "HIGH",
      score: 8,
      detail: `First meeting starts soon: ${events[0].title}`
    });
  }
  for (let i = 0; i < events.length - 1; i += 1) {
    const current = dayjs(events[i].time);
    const next = dayjs(events[i + 1].time);
    if (current.isValid() && next.isValid() && next.diff(current, "minute") <= 45) {
      scores.push({
        source: "calendar",
        priority: "NORMAL",
        score: 5,
        detail: `Back-to-back meetings: ${events[i].title} and ${events[i + 1].title}`
      });
      break;
    }
  }
  return scores;
}

function slackToScore(msg: SlackMessage): ScoredItem {
  const highPriority = /owner|manager/i.test(msg.from) || msg.urgencyScore >= 7;
  return {
    source: "slack",
    priority: highPriority ? "HIGH" : "NORMAL",
    score: msg.urgencyScore,
    detail: `${msg.from} in ${msg.channel}`
  };
}

export function scorePriorities(
  data: Pick<BriefingPayload, "emails" | "calendar" | "slack" | "crmDeals">,
  valueThreshold = 10000,
  staleDays = 3
): ScoredItem[] {
  const scored: ScoredItem[] = [
    ...data.emails.map(emailToScore),
    ...data.slack.map(slackToScore),
    ...data.crmDeals.map((deal) => crmToScore(deal, valueThreshold, staleDays)),
    ...calendarToScore(data.calendar)
  ];

  return scored.sort((a, b) => b.score - a.score);
}
