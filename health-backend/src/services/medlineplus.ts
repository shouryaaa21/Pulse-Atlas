import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { prisma } from "../lib/prisma";

// MedlinePlus is a free service of the U.S. National Library of Medicine
// (part of the NIH). It returns real, sourced consumer health topic
// summaries. Docs: https://medlineplus.gov/about/developers/webservices/
const MEDLINEPLUS_BASE = "https://wsearch.nlm.nih.gov/ws/query";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export type ConditionResult = {
  title: string;
  summary: string;
  sourceUrl: string;
  source: "MedlinePlus (NIH/NLM)";
  cached: boolean;
};

// Strips the <span class="qt0">...</span> highlight markup MedlinePlus
// puts around matched search terms in its XML response.
function stripHighlightTags(value: string): string {
  return value.replace(/<\/?span[^>]*>/g, "");
}

/**
 * Looks up a condition/health topic by name. Checks the local cache
 * first (refreshing after 24 hours), and falls back to a live call to
 * MedlinePlus otherwise.
 */
export async function searchCondition(query: string): Promise<ConditionResult | null> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const cached = await prisma.cachedCondition.findUnique({
    where: { query: normalized },
  });

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  if (cached && Date.now() - cached.fetchedAt.getTime() < ONE_DAY_MS) {
    return {
      title: cached.title,
      summary: cached.summary,
      sourceUrl: cached.sourceUrl,
      source: "MedlinePlus (NIH/NLM)",
      cached: true,
    };
  }

  const response = await axios.get(MEDLINEPLUS_BASE, {
    params: {
      db: "healthTopics",
      term: normalized,
      retmax: 1,
    },
    timeout: 8000,
  });

  const parsed = parser.parse(response.data);
  const documents = parsed?.nlmSearchResult?.list?.document;
  const firstDoc = Array.isArray(documents) ? documents[0] : documents;

  if (!firstDoc) return null;

  const contents: any[] = Array.isArray(firstDoc.content) ? firstDoc.content : [firstDoc.content];
  const findField = (name: string) =>
    contents.find((c) => c?.["@_name"] === name)?.["#text"] ?? "";

  const title = stripHighlightTags(String(findField("title") || query));
  const summary = stripHighlightTags(String(findField("FullSummary") || findField("snippet") || ""));
  const sourceUrl = String(firstDoc["@_url"] || "");

  if (!title) return null;

  await prisma.cachedCondition.upsert({
    where: { query: normalized },
    update: { title, summary, sourceUrl, fetchedAt: new Date() },
    create: { query: normalized, title, summary, sourceUrl },
  });

  return {
    title,
    summary,
    sourceUrl,
    source: "MedlinePlus (NIH/NLM)",
    cached: false,
  };
}
