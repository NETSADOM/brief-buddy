import Parser from "rss-parser";
import { NewsHeadline } from "../types/briefing";
import { withFallback, withTimeout } from "../utils/timeouts";

const parser = new Parser();

const DEFAULT_FEEDS = [
  "https://feeds.feedburner.com/entrepreneur/latest",
  "https://www.forbes.com/small-business/feed/",
  "https://techcrunch.com/category/startups/feed/"
];

export async function fetchIndustryNews(keywords: string[]): Promise<NewsHeadline[]> {
  return withFallback(
    () =>
      withTimeout(
        (async () => {
          const feeds = await Promise.all(DEFAULT_FEEDS.map((url) => parser.parseURL(url)));
          const items = feeds.flatMap((f) => f.items ?? []);
          const loweredKeywords = keywords.map((k) => k.toLowerCase());

          const relevant = items
            .filter((item) => {
              const text = `${item.title ?? ""} ${item.contentSnippet ?? ""}`.toLowerCase();
              return loweredKeywords.some((k) => text.includes(k));
            })
            .slice(0, 3)
            .map((item) => ({
              headline: item.title ?? "Untitled story",
              summary: (item.contentSnippet ?? "No summary available").slice(0, 140),
              source: item.link ?? "rss"
            }));

          return relevant;
        })(),
        10_000,
        "news-agent"
      ),
    [],
    "news-agent"
  );
}
