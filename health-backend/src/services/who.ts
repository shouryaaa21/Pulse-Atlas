import axios from "axios";
import { prisma } from "../lib/prisma";

// WHO's Global Health Observatory OData API. Free, no API key required.
// Docs: https://www.who.int/data/gho/info/gho-odata-api
const GHO_BASE = "https://ghoapi.azureedge.net/api";

// Friendly shortcuts for indicator codes we've confirmed by hand. WHO
// has 2,000+ indicators in total — rather than hand-typing all of them
// (and risking typos in codes that are easy to get wrong), use
// searchIndicatorCatalog() below to look up any other one you need by
// keyword, then either pass its code straight into getCountryIndicator
// or add a friendly name for it here.
export const INDICATORS: Record<string, string> = {
  lifeExpectancy: "WHOSIS_000001",
  maternalMortalityRatio: "MDG_0000000026",
  prematureNCDMortality: "NCDMORT3070", // dying 30-70 from CVD/cancer/diabetes/chronic respiratory disease
};

export type IndicatorPoint = {
  countryCode: string;
  indicatorCode: string;
  indicatorName: string;
  year: number | null;
  value: number | null;
};

let indicatorCatalogCache: { code: string; name: string }[] | null = null;
let indicatorCatalogFetchedAt = 0;

/**
 * Fetches (and caches in memory) WHO's full list of ~2,000 indicator
 * codes and names, so you can search it by keyword instead of guessing
 * codes. Refreshes once a day.
 */
async function loadIndicatorCatalog(): Promise<{ code: string; name: string }[]> {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  if (indicatorCatalogCache && Date.now() - indicatorCatalogFetchedAt < ONE_DAY_MS) {
    return indicatorCatalogCache;
  }

  const response = await axios.get(`${GHO_BASE}/Indicator`, { timeout: 15000 });
  const rows: any[] = response.data?.value ?? [];
  indicatorCatalogCache = rows.map((r) => ({
    code: String(r.IndicatorCode),
    name: String(r.IndicatorName),
  }));
  indicatorCatalogFetchedAt = Date.now();
  return indicatorCatalogCache;
}

/**
 * Searches WHO's indicator catalog by keyword, e.g. "diabetes" or
 * "tobacco" — use this to discover a real indicator code instead of
 * guessing one.
 */
export async function searchIndicatorCatalog(query: string) {
  const catalog = await loadIndicatorCatalog();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return catalog.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 25);
}

/**
 * Fetches the most recent value of one indicator for one country from
 * WHO GHO, caching the result locally. Accepts either a friendly key
 * from INDICATORS, or a raw WHO indicator code (e.g. from
 * searchIndicatorCatalog) directly.
 */
export async function getCountryIndicator(
  indicatorKeyOrCode: string,
  countryCode: string
): Promise<IndicatorPoint | null> {
  const indicatorCode = INDICATORS[indicatorKeyOrCode] ?? indicatorKeyOrCode;
  const indicatorName = INDICATORS[indicatorKeyOrCode] ? indicatorKeyOrCode : indicatorCode;

  const cached = await prisma.regionIndicator.findFirst({
    where: { countryCode, indicatorCode },
    orderBy: { fetchedAt: "desc" },
  });

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  if (cached && Date.now() - cached.fetchedAt.getTime() < ONE_WEEK_MS) {
    return {
      countryCode: cached.countryCode,
      indicatorCode: cached.indicatorCode,
      indicatorName: cached.indicatorName,
      year: cached.year,
      value: cached.value,
    };
  }

  const url = `${GHO_BASE}/${indicatorCode}`;
  const response = await axios.get(url, {
    params: { "$filter": `SpatialDim eq '${countryCode}'` },
    timeout: 8000,
  });

  const values: any[] = response.data?.value ?? [];
  if (!values.length) return null;

  // Take the most recent year available.
  const latest = values.reduce((a, b) => (a.TimeDim > b.TimeDim ? a : b));

  const point: IndicatorPoint = {
    countryCode,
    indicatorCode,
    indicatorName,
    year: latest.TimeDim ?? null,
    value: latest.NumericValue ?? null,
  };

  await prisma.regionIndicator.upsert({
    where: {
      countryCode_indicatorCode_year: {
        countryCode,
        indicatorCode,
        year: point.year ?? 0,
      },
    },
    update: { value: point.value, indicatorName: point.indicatorName, fetchedAt: new Date() },
    create: {
      countryCode,
      indicatorCode,
      indicatorName: point.indicatorName,
      year: point.year,
      value: point.value,
    },
  });

  return point;
}
