"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [time, setTime] = useState("--:--:-- UTC");

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toISOString().substring(11, 19) + " UTC");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a className="wordmark" href="#top" aria-label="PulseAtlas home">
          <span className="dot" />
          <span>PulseAtlas</span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#lookup">Look up a condition</a>
          <a href="#world">Global data</a>
          <a href="#modules">Modules</a>
        </nav>
        <div className="clock mono">{time}</div>
      </div>
    </header>
  );
}
