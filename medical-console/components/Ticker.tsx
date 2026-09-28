"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

type NewsItem = {
  id: string;
  sourceName: string;
  title: string;
  link: string;
  publishedAt: string | null;
};

export default function Ticker() {
  const [items, setItems] = useState<NewsItem[]>([]);

  async function load() {
    try {
      const res = await fetch(`${API_BASE}/api/news/latest`);
      if (!res.ok) return;
      setItems(await res.json());
    } catch {
      // Backend not running — ticker just stays empty rather than
      // showing fake headlines.
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000); // real feeds don't need much more often than this
    return () => clearInterval(id);
  }, []);

  const display = items.length ? [...items, ...items] : [];

  return (
    <div className="ticker-section">
      <div className="wrap ticker-row">
        <div className="ticker-label">
          <span className="dot" />
          LIVE FEED
        </div>
        <div className="ticker-track-outer">
          <div className="ticker-track">
            {display.length === 0 && (
              <div className="ticker-item">
                <span className="t">—</span> Start the backend to load live health news
              </div>
            )}
            {display.map((item, i) => (
              <a
                className="ticker-item"
                key={`${item.id}-${i}`}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                <span className="pulse" />
                <span className="t">{item.sourceName}</span> {item.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
