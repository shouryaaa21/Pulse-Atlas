import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { prisma } from "../lib/prisma";

// Real, publicly available health-news feeds. Add more here as you find
// ones relevant to your project — each just needs a name and a feed URL.
export const FEEDS: { name: string; url: string }[] = [
  { name: "CDC Newsroom", url: "https://www2c.cdc.gov/podcasts/feed.asp?feedid=183" },
  { name: "CDC Travel Notices", url: "https://wwwnc.cdc.gov/travel/rss/notices.xml" },
  { name: "CDC Emerging Infectious Diseases", url: "https://wwwnc.cdc.gov/eid/rss/ahead-of-print.xml" },
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

type NormalizedItem = {
  title: string;
  link: string;
  summary: string | null;
  publishedAt: Date | null;
};

// Feeds come in either classic RSS (<rss><channel><item>) or Atom
// (<feed><entry>) format — this normalizes either into the same shape.
function normalizeFeed(xml: string): NormalizedItem[] {
  const parsed = parser.parse(xml);

  const rssItems = parsed?.rss?.channel?.item;
  if (rssItems) {
    const items = Array.isArray(rssItems) ? rssItems : [rssItems];
    return items.map((it: any) => ({
      title: String(it.title ?? "").trim(),
      link: String(it.link ?? "").trim(),
      summary: it.description ? String(it.description).trim() : null,
      publishedAt: it.pubDate ? new Date(it.pubDate) : null,
    }));
  }

  const atomEntries = parsed?.feed?.entry;
  if (atomEntries) {
    const entries = Array.isArray(atomEntries) ? atomEntries : [atomEntries];
    return entries.map((it: any) => {
      const link = Array.isArray(it.link) ? it.link[0]?.["@_href"] : it.link?.["@_href"];
      return {
        title: String(it.title ?? "").trim(),
        link: String(link ?? "").trim(),
        summary: it.summary ? String(it.summary).trim() : null,
        publishedAt: it.updated ? new Date(it.updated) : null,
      };
    });
  }

  return [];
}

/**
 * Pulls fresh items from every configured feed and upserts them into the
 * database. Safe to call repeatedly (e.g. on a schedule) — existing
 * items are matched by link and left alone.
 */
export async function refreshNewsFeeds(): Promise<number> {
  let count = 0;

  for (const feed of FEEDS) {
    try {
      const response = await axios.get(feed.url, { timeout: 8000 });
      const items = normalizeFeed(response.data);

      for (const item of items.slice(0, 20)) {
        if (!item.link || !item.title) continue;
        await prisma.newsItem.upsert({
          where: { link: item.link },
          update: {}, // don't overwrite if we've already seen this link
          create: {
            sourceName: feed.name,
            title: item.title,
            link: item.link,
            summary: item.summary,
            publishedAt: item.publishedAt,
          },
        });
        count++;
      }
    } catch (err) {
      // One feed failing shouldn't take down the others.
      console.error(`Failed to refresh feed "${feed.name}":`, (err as Error).message);
    }
  }

  return count;
}

export async function getLatestNews(limit = 20) {
  return prisma.newsItem.findMany({
    orderBy: [{ publishedAt: "desc" }, { fetchedAt: "desc" }],
    take: limit,
  });
}
