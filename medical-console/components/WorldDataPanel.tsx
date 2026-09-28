"use client";

import { useEffect, useState } from "react";
import Globe from "./Globe";
import { API_BASE } from "@/lib/api";

// A small set of real countries with their ISO3 codes (what the WHO API
// expects). Add more here any time — no other code needs to change.
const regions: { name: string; iso3: string }[] = [
  { name: "India", iso3: "IND" },
  { name: "United States", iso3: "USA" },
  { name: "United Kingdom", iso3: "GBR" },
  { name: "Brazil", iso3: "BRA" },
  { name: "Nigeria", iso3: "NGA" },
  { name: "Japan", iso3: "JPN" },
  { name: "South Africa", iso3: "ZAF" },
  { name: "Germany", iso3: "DEU" },
];

type IndicatorPoint = {
  indicatorName: string;
  year: number | null;
  value: number | null;
};

export default function WorldDataPanel() {
  const [regionIdx, setRegionIdx] = useState(0);
  const [indicator, setIndicator] = useState<IndicatorPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIndicator(0);
  }, []);

  async function loadIndicator(idx: number) {
    setLoading(true);
    setError(null);
    try {
      const country = regions[idx].iso3;
      const res = await fetch(
        `${API_BASE}/api/regions/indicator?country=${country}&indicator=lifeExpectancy`
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
      const data = await res.json();
      setIndicator(data);
    } catch (err) {
      setError((err as Error).message);
      setIndicator(null);
    } finally {
      setLoading(false);
    }
  }

  function handleRotate() {
    // Occasionally move to a different region as the globe is dragged,
    // and fetch that region's real WHO data.
    if (Math.random() < 0.03) {
      const next = (regionIdx + 1) % regions.length;
      setRegionIdx(next);
      loadIndicator(next);
    }
  }

  return (
    <div className="world-panel">
      <div className="data-readout">
        <div>
          <div className="region-name">{regions[regionIdx].name}</div>
          <div className="region-hint">Drag the globe to load another country's data</div>
        </div>

        {loading && <div className="metric"><span>Loading…</span><span>—</span></div>}
        {error && <div className="metric"><span>Error</span><span>{error}</span></div>}

        {indicator && (
          <>
            <div className="metric">
              <span>Life expectancy at birth</span>
              <span>{indicator.value?.toFixed(1) ?? "—"} yrs</span>
            </div>
            <div className="metric">
              <span>Data year</span>
              <span>{indicator.year ?? "—"}</span>
            </div>
          </>
        )}

        {!indicator && !loading && !error && (
          <div className="metric">
            <span>Drag the globe to load data</span>
            <span>—</span>
          </div>
        )}

        <div className="source-tag">SOURCE: WHO Global Health Observatory</div>
        <div className="drag-hint">↕ ↔ drag to rotate</div>
      </div>
      <div className="world-globe-wrap">
        <Globe nodeCount={20} nodeColor="#4fa3c7" onRotate={handleRotate} />
      </div>
    </div>
  );
}
