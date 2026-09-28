"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setTime(new Date().toISOString().substring(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer>
      <div className="wrap footer-row">
        <div className="footer-status">
          <span className="pulse" />
          SYSTEMS NOMINAL · <span className="mono">{time} UTC</span>
        </div>
        <div className="footer-copy">PulseAtlas · sourced health intelligence</div>
      </div>
    </footer>
  );
}
