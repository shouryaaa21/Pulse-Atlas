import axios from "axios";
import { XMLParser } from "fast-xml-parser";

// PubMed E-utilities — a free, public API from the National Center for
// Biotechnology Information (NCBI, part of NIH). No API key required
// for light use. Docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
const ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const ESUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

export type PubMedResult = {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  url: string;
};

/**
 * Finds real, recent PubMed articles related to a condition or
 * symptom — actual published research, not generated text. Good for
 * backing up a "medical approach" tab with citations rather than
 * unsourced claims.
 */
export async function searchPubMed(query: string, max = 5): Promise<PubMedResult[]> {
  const searchResponse = await axios.get(ESEARCH, {
    params: {
      db: "pubmed",
      term: query,
      retmax: max,
      sort: "relevance",
      retmode: "json",
    },
    timeout: 8000,
  });

  const ids: string[] = searchResponse.data?.esearchresult?.idlist ?? [];
  if (!ids.length) return [];

  const summaryResponse = await axios.get(ESUMMARY, {
    params: {
      db: "pubmed",
      id: ids.join(","),
      retmode: "json",
    },
    timeout: 8000,
  });

  const result = summaryResponse.data?.result;
  if (!result) return [];

  return ids
    .map((id) => result[id])
    .filter(Boolean)
    .map((doc: any) => ({
      pmid: String(doc.uid),
      title: String(doc.title ?? "").trim(),
      journal: String(doc.fulljournalname ?? doc.source ?? ""),
      year: String(doc.pubdate ?? "").slice(0, 4),
      url: `https://pubmed.ncbi.nlm.nih.gov/${doc.uid}/`,
    }));
}
