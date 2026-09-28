"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Globe from "./Globe";

const rise = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Hero() {
  const [coords, setCoords] = useState("14.2°N 34.8°W");
  const [latency, setLatency] = useState("212ms");
  const stageRef = useRef<HTMLDivElement>(null);

  // Mouse-parallax tilt on the globe stage — springed so it settles smoothly
  // rather than snapping to the cursor.
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 80, damping: 14 });
  const rotateY = useSpring(rawRotateY, { stiffness: 80, damping: 14 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateY.set(px * 14);
    rawRotateX.set(-py * 14);
  }

  function handleMouseLeave() {
    rawRotateX.set(0);
    rawRotateY.set(0);
  }

  useEffect(() => {
    const id = setInterval(() => {
      const lat = (Math.random() * 60 - 30).toFixed(1);
      const lon = (Math.random() * 80 - 40).toFixed(1);
      setCoords(
        `${Math.abs(Number(lat))}°${Number(lat) < 0 ? "S" : "N"} ${Math.abs(
          Number(lon)
        )}°${Number(lon) < 0 ? "E" : "W"}`
      );
      setLatency(`${180 + Math.round(Math.random() * 70)}ms`);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <motion.div
          className="kicker"
          initial="hidden"
          animate="show"
          variants={rise}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <span className="bar" />
          LIVE GLOBAL HEALTH DATA
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={rise}
          transition={{ duration: 0.7, delay: 0.18 }}
        >
          Every health signal on Earth, <span className="accent">in one view.</span>
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial="hidden"
          animate="show"
          variants={rise}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          PulseAtlas brings together sourced condition overviews, current research, health feeds, and global indicators in a calm, explorable console.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial="hidden"
          animate="show"
          variants={rise}
          transition={{ duration: 0.6, delay: 0.52 }}
        >
          <a className="btn btn-primary" href="#lookup">Look up a condition <span aria-hidden="true">↗</span></a>
          <a className="btn btn-ghost" href="#world">Explore global data</a>
        </motion.div>

        <motion.div
          className="hero-readout"
          initial="hidden"
          animate="show"
          variants={rise}
          transition={{ duration: 0.6, delay: 0.64 }}
        >
          <div>
            REGIONS TRACKED
            <span>41</span>
          </div>
          <div>
            LIVE SOURCES
            <span>04</span>
          </div>
          <div>
            LATENCY
            <span className="mono">{latency}</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        ref={stageRef}
        className="globe-stage"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 900 }}
      >
        <span className="globe-tag tl mono">SECTOR · GLOBAL</span>
        <span className="globe-tag br mono">{coords}</span>
        <motion.div style={{ rotateX, rotateY, width: "100%", height: "100%" }}>
          <Globe nodeCount={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
