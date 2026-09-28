"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { API_BASE } from "@/lib/api";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "research", label: "Research" },
  { id: "precautions", label: "Precautions" },
  { id: "nonmedical", label: "Non-medical approach" },
  { id: "history", label: "Historical use" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type ConditionResult = {
  title: string;
  summary: string;
  sourceUrl: string;
  source: string;
};

type Citation = {
  title: string;
  journal: string;
  year: string;
  url: string;
};

// These three don't have a wired-up real source yet (see the backend
// README) — shown honestly rather than filled with invented text.
const unsourcedNote =
  "No verified source is connected for this tab yet. This needs real, cited content from a qualified source before it goes live — not generated text.";

export default function LookupPanel() {
  const [query, setQuery] = useState("migraine");
  const [active, setActive] = useState<TabId>("overview");
  const [result, setResult] = useState<ConditionResult | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runSearch("migraine");
  }, []);

  async function runSearch(q: string) {
    setLoading(true);
    setError(null);
    try {
      const [condRes, citeRes] = await Promise.all([
        fetch(`${API_BASE}/api/conditions/search?q=${encodeURIComponent(q)}`),
        fetch(`${API_BASE}/api/conditions/citations?q=${encodeURIComponent(q)}`),
      ]);

      if (!condRes.ok) throw new Error((await condRes.json()).error ?? "Search failed");
      setResult(await condRes.json());
      setCitations(citeRes.ok ? await citeRes.json() : []);
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
      setCitations([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query);
  }

  function renderTabContent() {
    if (active === "overview") {
      if (loading) return "Loading from MedlinePlus…";
      if (error) return `Couldn't reach the backend: ${error}`;
      if (!result) return "Search a condition above to see its MedlinePlus overview.";
      return result.summary || result.title;
    }
    if (active === "research") {
      if (loading) return "Loading from PubMed…";
      if (!citations.length) return "No PubMed articles found for this search yet.";
      return (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {citations.map((c) => (
            <li key={c.url}>
              <a href={c.url} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
                {c.title}
              </a>
              <div className="mono" style={{ color: "var(--ink-dimmer)", fontSize: "0.72rem", marginTop: 2 }}>
                {c.journal} · {c.year}
              </div>
            </li>
          ))}
        </ul>
      );
    }
    return unsourcedNote;
  }

  return (
    <div className="lookup-grid">
      <div className="panel">
        <form className="search-input" onSubmit={handleSubmit}>
          <span className="mono" style={{ color: "var(--ink-dimmer)" }}>
            &gt;
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a condition or symptom"
          />
        </form>

        <div className="tab-row">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab${active === tab.id ? " active" : ""}`}
              onClick={() => setActive(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content" style={{ position: "relative", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="source-tag">
          {result ? (
            <a href={result.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
              SOURCE: {result.source} — view full article ↗
            </a>
          ) : (
            "SOURCE: connect by searching above"
          )}
        </div>
      </div>

      <div className="panel side-stat">
        <div className="stat-row">
          <span className="stat-label">Backend</span>
          <span className="stat-value">{API_BASE}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Last query</span>
          <span className="stat-value">{result ? result.title : "—"}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">PubMed articles found</span>
          <span className="stat-value">{citations.length}</span>
        </div>
      </div>
    </div>
  );
}
