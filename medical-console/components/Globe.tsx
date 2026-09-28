"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float } from "@react-three/drei";
import * as THREE from "three";

type GlobeProps = {
  nodeCount?: number;
  wireColor?: string;
  nodeColor?: string;
  autoRotateSpeed?: number;
  onRotate?: () => void;
};

const RADIUS = 2.02;
const ORIGIN = new THREE.Vector3(0, 0, 0);

function pointOnSphere(lat: number, lon: number, r = RADIUS): THREE.Vector3 {
  return new THREE.Vector3(
    r * Math.cos(lat) * Math.cos(lon),
    r * Math.sin(lat),
    r * Math.cos(lat) * Math.sin(lon)
  );
}

/** A single node with a slowly expanding, fading "signal ping" ring. */
function PingNode({ position, color, phase }: { position: THREE.Vector3; color: string; phase: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const duration = 2.6;

  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() + phase) % duration) / duration;
    if (ringRef.current) {
      const scale = 0.06 + t * 0.55;
      ringRef.current.scale.setScalar(scale);
      ringRef.current.lookAt(ORIGIN);
    }
    if (ringMat.current) {
      ringMat.current.opacity = 0.55 * (1 - t);
    }
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.85, 1, 24]} />
        <meshBasicMaterial ref={ringMat} color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** A curved arc between two node positions, with a small pulse travelling along it. */
function DataArc({ a, b, color }: { a: THREE.Vector3; b: THREE.Vector3; color: string }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.18 + Math.random() * 0.14, []);
  const phase = useMemo(() => Math.random(), []);

  const curve = useMemo(() => {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(RADIUS * 1.35);
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }, [a, b]);

  const points = useMemo(() => curve.getPoints(32), [curve]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * speed + phase) % 1;
    if (pulseRef.current) {
      const p = curve.getPoint(t);
      pulseRef.current.position.copy(p);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      // fade in/out near the ends of the path so it doesn't "pop"
      mat.opacity = Math.sin(Math.PI * t) * 0.9 + 0.1;
    }
  });

  return (
    <group>
      <line>
        <primitive object={geometry} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={0.22} />
      </line>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={1} />
      </mesh>
    </group>
  );
}

function Nodes({ count, color }: { count: number; color: string }) {
  const positions = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const lat = (Math.random() - 0.5) * Math.PI;
      const lon = Math.random() * Math.PI * 2;
      pts.push(pointOnSphere(lat, lon));
    }
    return pts;
  }, [count]);

  const arcs = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    const arcCount = Math.max(3, Math.floor(count * 0.5));
    for (let i = 0; i < arcCount; i++) {
      const a = positions[Math.floor(Math.random() * positions.length)];
      const b = positions[Math.floor(Math.random() * positions.length)];
      if (a !== b) pairs.push([a, b]);
    }
    return pairs;
  }, [positions, count]);

  return (
    <>
      {positions.map((p, i) => (
        <PingNode key={i} position={p} color={color} phase={(i / positions.length) * 2.6} />
      ))}
      {arcs.map(([a, b], i) => (
        <DataArc key={i} a={a} b={b} color={color} />
      ))}
    </>
  );
}

function SceneContents({
  nodeCount = 16,
  wireColor = "#2c4a5c",
  nodeColor = "#4fb286",
  autoRotateSpeed = 0.35,
}: GlobeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * autoRotateSpeed * 0.35;
    }
  });

  return (
    <>
      <Stars radius={30} depth={20} count={900} factor={1.4} saturation={0} fade speed={0.4} />
      <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.35}>
        <group ref={groupRef}>
          <mesh>
            <sphereGeometry args={[2, 24, 18]} />
            <meshBasicMaterial color={wireColor} wireframe transparent opacity={0.55} />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.94, 24, 18]} />
            <meshBasicMaterial color="#0f1620" transparent opacity={0.9} />
          </mesh>
          <Nodes count={nodeCount} color={nodeColor} />
        </group>
      </Float>
    </>
  );
}

export default function Globe({
  nodeCount = 16,
  wireColor,
  nodeColor,
  autoRotateSpeed,
  onRotate,
}: GlobeProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      style={{ width: "100%", height: "100%", cursor: "grab" }}
      dpr={[1, 2]}
    >
      <SceneContents
        nodeCount={nodeCount}
        wireColor={wireColor}
        nodeColor={nodeColor}
        autoRotateSpeed={autoRotateSpeed}
      />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        onChange={onRotate}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}
