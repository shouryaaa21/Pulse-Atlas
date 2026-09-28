"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const modules = [
  {
    name: "Global Health Data",
    status: "LIVE",
    desc: "Regional case density and advisories wired to the world globe.",
  },
  {
    name: "Condition Lookup",
    status: "LIVE",
    desc: "Symptoms, precautions, medical and non-medical approaches per condition.",
  },
  {
    name: "Live Health Feed",
    status: "LIVE",
    desc: "Scrolling advisories and outbreak news from connected sources.",
  },
  {
    name: "Historical Remedies",
    status: "BETA",
    desc: "How different regions and eras approached the same conditions.",
  },
  {
    name: "Source Verification",
    status: "QUEUED",
    desc: "Per-entry sourcing and last-verified timestamps.",
  },
  {
    name: "Personal Symptom Log",
    status: "QUEUED",
    desc: "A private log a person can keep and compare against the index.",
  },
];

function TiltModule({ m }: { m: (typeof modules)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 220, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 220, damping: 18 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 8);
    rx.set(-py * 8);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className="module"
      style={{ rotateX, rotateY, transformPerspective: 700 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="module-top">
        <span className={`module-status mono${m.status === "LIVE" ? " live" : ""}`}>
          {m.status}
        </span>
      </div>
      <div>
        <h3>{m.name}</h3>
        <p>{m.desc}</p>
      </div>
    </motion.div>
  );
}

export default function ModuleGrid() {
  return (
    <div className="module-grid">
      {modules.map((m) => (
        <TiltModule m={m} key={m.name} />
      ))}
      <div className="module-slot">
        <div className="plus">+</div>
        <span>Next module takes this slot</span>
      </div>
    </div>
  );
}
