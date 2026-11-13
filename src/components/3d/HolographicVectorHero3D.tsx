"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, Billboard, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  Heart,
  Activity,
  Dna,
  Brain,
  Cross,
  Pill,
  Syringe,
  Atom,
  Stethoscope,
  Scan,
  Maximize2,
  Sparkles,
  Layers,
  RotateCcw,
  Zap,
  CheckCircle2,
  Cpu,
  Eye,
  Sliders,
  ShieldCheck,
  FileText,
  AlertCircle,
  Thermometer,
  Gauge,
  Wind,
} from "lucide-react";

// =========================================================================
// TYPES & METADATA
// =========================================================================
export type CameraPreset = "overview" | "patient" | "doctor" | "telemetry";
export type OrganFocus = "heart" | "lungs" | "brain" | "vitals";

interface HexagonData {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  pos: [number, number, number];
  color: string;
  glow: string;
  stats: string;
  metric: string;
  productRef: string;
}

const HEX_MODULES: HexagonData[] = [
  {
    id: "cardio",
    name: "Cardiovascular Telemetry",
    subtitle: "Continuous hemodynamic telemetry & 12-lead EKG analysis",
    category: "VITAL TELEMETRY",
    icon: Activity,
    pos: [0, 0.48, 0.2],
    color: "#00E5FF",
    glow: "#00FFFF",
    stats: "74 BPM • Regular Sinus Rhythm",
    metric: "99.8%",
    productRef: "Nakbho Clinical Suite",
  },
  {
    id: "genomics",
    name: "Genomic Sequencing",
    subtitle: "Precision oncology biomarkers & DNA profile synchronization",
    category: "MOLECULAR BIOLOGY",
    icon: Dna,
    pos: [-0.75, 0.92, 0.08],
    color: "#12CDB5",
    glow: "#14F195",
    stats: "HLA-B27 Negative • Mutation Panel Clean",
    metric: "100%",
    productRef: "LPC-Federate Diagnostics",
  },
  {
    id: "neuro",
    name: "Neural Diagnostics",
    subtitle: "Cognitive assessment & 16-channel EEG telemetry",
    category: "AI NEUROLOGY",
    icon: Brain,
    pos: [0.75, 0.92, 0.08],
    color: "#38BDF8",
    glow: "#00E5FF",
    stats: "Alpha 10.2 Hz • Cognitive Index 94/100",
    metric: "99.1%",
    productRef: "NeuroSynapse AI",
  },
  {
    id: "clinical",
    name: "Clinical Core Systems",
    subtitle: "Hospital-wide EMR, bed management & clinical order entry",
    category: "CLINICAL SYSTEMS",
    icon: Cross,
    pos: [0, 1.35, -0.05],
    color: "#43E6D0",
    glow: "#43E6D0",
    stats: "FHIR / HL7 v2.8 Live • Zero Latency",
    metric: "ONLINE",
    productRef: "ClinicDots Hospital OS",
  },
  {
    id: "pharmacy",
    name: "Smart Pharmacotherapy",
    subtitle: "AI-driven drug-drug interaction checker & automated e-Rx",
    category: "PHARMACEUTICAL",
    icon: Pill,
    pos: [0.75, 0.04, 0.08],
    color: "#00E5FF",
    glow: "#12CDB5",
    stats: "3 Active Medications • 0 Interactions",
    metric: "SAFE",
    productRef: "PharmCare Automation",
  },
  {
    id: "therapeutics",
    name: "Precision Therapeutics",
    subtitle: "Targeted intravenous infusion telemetry & closed-loop dosage",
    category: "THERAPEUTICS",
    icon: Syringe,
    pos: [-0.75, 0.04, 0.08],
    color: "#14F195",
    glow: "#10B981",
    stats: "Flow: 25 ml/hr • Pressure: 12 psi",
    metric: "STEADY",
    productRef: "InfuseSmart Nexus",
  },
  {
    id: "biochem",
    name: "Biochemical Pathology",
    subtitle: "Sub-second lab analyzer telemetry & automated critical alerts",
    category: "LAB DIAGNOSTICS",
    icon: Atom,
    pos: [0, -0.42, 0.18],
    color: "#60A5FA",
    glow: "#38BDF8",
    stats: "Metabolic Panel Complete • 0 Flags",
    metric: "NORMAL",
    productRef: "PathoLab Express LIS",
  },
];

// =========================================================================
// PROCEDURAL HIGH-DENSITY SOLID + WIREFRAME ANATOMICAL BODY
// =========================================================================
function createFullAnatomyPlexus() {
  const vertices: number[] = [];
  const indices: number[] = [];

  function addRing(y: number, rx: number, rz: number, cx = 0, cz = 0, segments = 14) {
    const startIdx = vertices.length / 3;
    for (let s = 0; s < segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      vertices.push(cx + Math.cos(angle) * rx, y, cz + Math.sin(angle) * rz);
    }
    return { startIdx, segments };
  }

  function connectRings(
    ringA: { startIdx: number; segments: number },
    ringB: { startIdx: number; segments: number }
  ) {
    const seg = Math.min(ringA.segments, ringB.segments);
    for (let s = 0; s < seg; s++) {
      const a1 = ringA.startIdx + s;
      const a2 = ringA.startIdx + ((s + 1) % seg);
      const b1 = ringB.startIdx + s;
      const b2 = ringB.startIdx + ((s + 1) % seg);
      indices.push(a1, a2, b1);
      indices.push(a2, b2, b1);
    }
  }

  // Cranium (Solid Faceted Head)
  const headGeom = new THREE.IcosahedronGeometry(0.24, 2);
  const headPos = headGeom.attributes.position;
  const headStartIdx = vertices.length / 3;
  for (let i = 0; i < headPos.count; i++) {
    vertices.push(headPos.getX(i), headPos.getY(i) * 1.15 + 1.48, headPos.getZ(i));
  }
  const headIndices = headGeom.index ? Array.from(headGeom.index.array) : [];
  for (const idx of headIndices) {
    indices.push(headStartIdx + idx);
  }

  // Torso Contours
  let prevRing = addRing(1.18, 0.12, 0.12);
  const torsoProfiles = [
    { y: 1.05, rx: 0.36, rz: 0.2 },
    { y: 0.88, rx: 0.38, rz: 0.22 },
    { y: 0.72, rx: 0.33, rz: 0.19 },
    { y: 0.54, rx: 0.26, rz: 0.16 },
    { y: 0.38, rx: 0.28, rz: 0.18 },
    { y: 0.22, rx: 0.31, rz: 0.2 },
  ];
  for (const p of torsoProfiles) {
    const ring = addRing(p.y, p.rx, p.rz);
    connectRings(prevRing, ring);
    prevRing = ring;
  }

  // Legs (Left & Right)
  const legSides = [-0.15, 0.15];
  for (const cx of legSides) {
    let prevLegRing = addRing(0.18, 0.12, 0.12, cx);
    const legProfiles = [
      { y: 0.0, rx: 0.11, rz: 0.11 },
      { y: -0.22, rx: 0.095, rz: 0.095 },
      { y: -0.45, rx: 0.08, rz: 0.08 },
      { y: -0.72, rx: 0.085, rz: 0.085 },
      { y: -1.05, rx: 0.065, rz: 0.065 },
      { y: -1.25, rx: 0.075, rz: 0.14, cz: 0.04 },
    ];
    for (const p of legProfiles) {
      const ring = addRing(p.y, p.rx, p.rz, cx, p.cz || 0);
      connectRings(prevLegRing, ring);
      prevLegRing = ring;
    }
  }

  // Arms (Clinical Outstretched Avatar Posture)
  const armSides = [-1, 1];
  for (const side of armSides) {
    let prevArmRing = addRing(1.0, 0.09, 0.09, side * 0.36);
    const armProfiles = [
      { y: 0.85, rx: 0.075, rz: 0.075, cx: side * 0.52 },
      { y: 0.65, rx: 0.065, rz: 0.065, cx: side * 0.72 },
      { y: 0.45, rx: 0.055, rz: 0.055, cx: side * 0.92 },
      { y: 0.25, rx: 0.045, rz: 0.06, cx: side * 1.12 },
    ];
    for (const p of armProfiles) {
      const ring = addRing(p.y, p.rx, p.rz, p.cx);
      connectRings(prevArmRing, ring);
      prevArmRing = ring;
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// =========================================================================
// PROCEDURAL DOCTOR PHYSICIAN MESH (Solid Clinical Lab Coat & Folded Arms)
// =========================================================================
function createDoctorPlexus() {
  const vertices: number[] = [];
  const indices: number[] = [];

  function addRing(y: number, rx: number, rz: number, cx = 0, cz = 0, segments = 14) {
    const startIdx = vertices.length / 3;
    for (let s = 0; s < segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      vertices.push(cx + Math.cos(angle) * rx, y, cz + Math.sin(angle) * rz);
    }
    return { startIdx, segments };
  }

  function connectRings(
    ringA: { startIdx: number; segments: number },
    ringB: { startIdx: number; segments: number }
  ) {
    const seg = Math.min(ringA.segments, ringB.segments);
    for (let s = 0; s < seg; s++) {
      const a1 = ringA.startIdx + s;
      const a2 = ringA.startIdx + ((s + 1) % seg);
      const b1 = ringB.startIdx + s;
      const b2 = ringB.startIdx + ((s + 1) % seg);
      indices.push(a1, a2, b1);
      indices.push(a2, b2, b1);
    }
  }

  // Doctor Head
  const headGeom = new THREE.IcosahedronGeometry(0.26, 2);
  const headPos = headGeom.attributes.position;
  const headStartIdx = vertices.length / 3;
  for (let i = 0; i < headPos.count; i++) {
    vertices.push(headPos.getX(i), headPos.getY(i) * 1.15 + 1.48, headPos.getZ(i));
  }
  const headIndices = headGeom.index ? Array.from(headGeom.index.array) : [];
  for (const idx of headIndices) {
    indices.push(headStartIdx + idx);
  }

  // Lab Coat Torso
  let prevRing = addRing(1.18, 0.15, 0.14);
  const coatProfiles = [
    { y: 1.05, rx: 0.44, rz: 0.24 },
    { y: 0.88, rx: 0.46, rz: 0.26 },
    { y: 0.68, rx: 0.42, rz: 0.28, cz: 0.08 },
    { y: 0.48, rx: 0.38, rz: 0.24, cz: 0.05 },
    { y: 0.22, rx: 0.39, rz: 0.25 },
    { y: -0.15, rx: 0.42, rz: 0.28 },
    { y: -0.55, rx: 0.44, rz: 0.29 },
  ];
  for (const p of coatProfiles) {
    const ring = addRing(p.y, p.rx, p.rz, 0, p.cz || 0);
    connectRings(prevRing, ring);
    prevRing = ring;
  }

  // Folded Arms Curve across chest
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.42, 0.95, 0.05),
    new THREE.Vector3(-0.35, 0.72, 0.24),
    new THREE.Vector3(0.0, 0.66, 0.3),
    new THREE.Vector3(0.35, 0.7, 0.25),
    new THREE.Vector3(0.42, 0.95, 0.05),
  ]);
  const armGeom = new THREE.TubeGeometry(armCurve, 20, 0.08, 8, false);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return { geom, armGeom };
}

// =========================================================================
// 1. EXTRAORDINARY HOLOGRAPHIC PATIENT WITH INTERNAL GLOWING ORGANS
// =========================================================================
function HolographicPatient({
  isHovered,
  organFocus,
  onSelectOrgan,
}: {
  isHovered: boolean;
  organFocus: OrganFocus;
  onSelectOrgan: (organ: OrganFocus) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const heartMeshRef = useRef<THREE.Mesh>(null);
  const heartLightRef = useRef<THREE.PointLight>(null);
  const lungsGroupRef = useRef<THREE.Group>(null);
  const brainMeshRef = useRef<THREE.Mesh>(null);
  const scanRingRef = useRef<THREE.Group>(null);

  const bodyGeom = useMemo(() => createFullAnatomyPlexus(), []);
  const bodyWireGeom = useMemo(() => new THREE.WireframeGeometry(bodyGeom), [bodyGeom]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Gentle respiration float
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
    }

    // Realistic double-pulse heartbeat (lub-dub)
    const beat = (t * 2.1) % 1;
    let pulse = 0;
    if (beat < 0.14) {
      pulse = Math.sin((beat / 0.14) * Math.PI) * 0.45;
    } else if (beat > 0.18 && beat < 0.32) {
      pulse = Math.sin(((beat - 0.18) / 0.14) * Math.PI) * 0.28;
    }

    // Heart pulsation & emissive intensity
    if (heartMeshRef.current) {
      const s = 1 + pulse + (organFocus === "heart" ? 0.3 : 0);
      heartMeshRef.current.scale.set(s, s, s);
      const mat = heartMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2.8 + pulse * 4.5 + (organFocus === "heart" ? 1.5 : 0);
    }

    if (heartLightRef.current) {
      heartLightRef.current.intensity = 3.5 + pulse * 6.0;
    }

    // Lungs breathing expansion
    if (lungsGroupRef.current) {
      const breath = 1 + Math.sin(t * 1.8) * 0.12 + (organFocus === "lungs" ? 0.2 : 0);
      lungsGroupRef.current.scale.set(breath, breath, 1);
    }

    // Brain neural pulse
    if (brainMeshRef.current) {
      const bPulse = 1 + Math.sin(t * 3.0) * 0.08 + (organFocus === "brain" ? 0.25 : 0);
      brainMeshRef.current.scale.set(bPulse, bPulse, bPulse);
      const bMat = brainMeshRef.current.material as THREE.MeshStandardMaterial;
      bMat.emissiveIntensity = 2.0 + Math.sin(t * 4.0) * 1.2;
    }

    // Sweeping diagnostic scanner laser
    if (scanRingRef.current) {
      scanRingRef.current.position.y = -0.1 + Math.sin(t * 2.2) * 1.35;
    }
  });

  return (
    <group ref={groupRef} position={[-2.0, 0, 0]}>
      {/* 1. SOLID TRANSLUCENT ANATOMICAL SILHOUETTE (Rich Substance & Depth) */}
      <mesh geometry={bodyGeom}>
        <meshPhysicalMaterial
          color="#042038"
          emissive="#00E5FF"
          emissiveIntensity={0.35}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.65}
          transmission={0.35}
        />
      </mesh>

      {/* 2. CRISP LUMINOUS WIREFRAME OVERLAY */}
      <lineSegments geometry={bodyWireGeom}>
        <lineBasicMaterial
          color="#00FFFF"
          transparent
          opacity={0.75}
          linewidth={1.5}
        />
      </lineSegments>

      {/* 3. SPARKLING PLEXUS VERTEX NODES */}
      <points geometry={bodyGeom}>
        <pointsMaterial
          size={0.045}
          color="#00FFFF"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ========================================================= */}
      {/* INTERNAL GLOWING ORGANS (Visible & Meaningful on Zoom)   */}
      {/* ========================================================= */}

      {/* A. GLOWING NEURAL BRAIN CORTEX (Inside Head at Y=1.5) */}
      <group position={[0, 1.48, 0]}>
        <mesh ref={brainMeshRef}>
          <sphereGeometry args={[0.13, 20, 20]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00FFFF"
            emissiveIntensity={2.5}
            roughness={0.2}
          />
        </mesh>
        <pointLight color="#00E5FF" intensity={1.8} distance={1.4} />
      </group>

      {/* B. GLOWING RESPIRATORY LUNGS (Inside Chest at Y=0.85) */}
      <group ref={lungsGroupRef} position={[0, 0.85, 0.05]}>
        {/* Left Lung Lobe */}
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.07, 0.09, 0.28, 16]} />
          <meshStandardMaterial
            color="#12CDB5"
            emissive="#14F195"
            emissiveIntensity={organFocus === "lungs" ? 2.5 : 1.2}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Right Lung Lobe */}
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.07, 0.09, 0.28, 16]} />
          <meshStandardMaterial
            color="#12CDB5"
            emissive="#14F195"
            emissiveIntensity={organFocus === "lungs" ? 2.5 : 1.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* C. GLOWING ANATOMICAL HEART (Inside Left Chest at Y=0.76) */}
      <group position={[-0.1, 0.76, 0.12]}>
        <mesh ref={heartMeshRef}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#00FFFF"
            emissiveIntensity={3.5}
            roughness={0.1}
          />
        </mesh>
        {/* Outer Pulsing Corona */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color="#00E5FF"
            wireframe
            transparent
            opacity={0.55}
          />
        </mesh>
        <pointLight
          ref={heartLightRef}
          color="#00FFFF"
          distance={3.2}
          intensity={4.0}
        />
      </group>

      {/* D. GLOWING SPINAL VERTEBRAE (Running Down Back) */}
      <group position={[0, 0.65, -0.08]}>
        {[-0.4, -0.25, -0.1, 0.05, 0.2, 0.35].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0]}>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshBasicMaterial color="#00FFFF" />
          </mesh>
        ))}
      </group>

      {/* SWEEPING CYAN DIAGNOSTIC LASER SCANNER RING */}
      <group ref={scanRingRef} position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.015, 12, 64]} />
          <meshBasicMaterial color="#00FFFF" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.61, 32]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight color="#00FFFF" intensity={2.2} distance={1.4} />
      </group>

      {/* Circular HUD Reticle ("Ready" & "79%") */}
      <Billboard position={[-0.75, 1.45, 0]}>
        <group>
          <mesh>
            <ringGeometry args={[0.28, 0.3, 36]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[0.2, 0.21, 24]} />
            <meshBasicMaterial
              color="#12CDB5"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Text
            position={[0, 0.04, 0.01]}
            fontSize={0.075}
            color="#00FFFF"
            anchorX="center"
            anchorY="middle"
          >
            Ready
          </Text>
          <Text
            position={[0, -0.06, 0.01]}
            fontSize={0.065}
            color="#94A3B8"
            anchorX="center"
            anchorY="middle"
          >
            79%
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

// =========================================================================
// 2. EXTRAORDINARY HOLOGRAPHIC DOCTOR (Physician AI with Tablet & Stethoscope)
// =========================================================================
function HolographicDoctor({
  isHovered,
}: {
  isHovered: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const neuralPointsRef = useRef<THREE.Points>(null);

  const { geom: docGeom, armGeom: docArmGeom } = useMemo(() => createDoctorPlexus(), []);
  const docWireGeom = useMemo(() => new THREE.WireframeGeometry(docGeom), [docGeom]);
  const docArmWireGeom = useMemo(() => new THREE.WireframeGeometry(docArmGeom), [docArmGeom]);

  // 3D Stethoscope Spline Path
  const stethCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.48, 0.08),
      new THREE.Vector3(-0.18, 0.22, 0.26),
      new THREE.Vector3(-0.06, 0.04, 0.32),
      new THREE.Vector3(0.04, -0.15, 0.34),
      new THREE.Vector3(0.06, -0.22, 0.32),
      new THREE.Vector3(0.0, 0.02, 0.3),
      new THREE.Vector3(0.18, 0.22, 0.26),
      new THREE.Vector3(0.16, 0.48, 0.08),
    ]);
  }, []);

  const stethGeom = useMemo(
    () => new THREE.TubeGeometry(stethCurve, 48, 0.018, 8, false),
    [stethCurve]
  );

  // Sparkling Neural Synaptic Point Cloud inside brain & lab coat
  const neuralPoints = useMemo(() => {
    const coords: number[] = [];
    const count = 260;
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.26;
      coords.push(
        r * Math.sin(phi) * Math.cos(theta),
        1.48 + r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.3 + 1.0) * 0.02;
    }

    if (neuralPointsRef.current) {
      const mat = neuralPointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.7 + Math.sin(t * 4.0) * 0.3;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[2.1, 0, 0]}
      rotation={[0, -0.38, 0]}
    >
      {/* 1. SOLID LAB COAT MESH (Substance & Rich Lighting) */}
      <mesh geometry={docGeom}>
        <meshPhysicalMaterial
          color="#062644"
          emissive="#00B4D8"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 2. LUMINOUS WIREFRAME OVERLAY */}
      <lineSegments geometry={docWireGeom}>
        <lineBasicMaterial
          color="#00FFFF"
          transparent
          opacity={0.75}
          linewidth={1.5}
        />
      </lineSegments>

      {/* 3. SPARKLING PLEXUS VERTEX NODES */}
      <points geometry={docGeom}>
        <pointsMaterial
          size={0.045}
          color="#00FFFF"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Folded Arms Mesh with Wireframe */}
      <mesh geometry={docArmGeom}>
        <meshPhysicalMaterial
          color="#073054"
          emissive="#00E5FF"
          emissiveIntensity={0.45}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.75}
        />
      </mesh>
      <lineSegments geometry={docArmWireGeom}>
        <lineBasicMaterial color="#00FFFF" transparent opacity={0.85} />
      </lineSegments>

      {/* 3D GLOWING STETHOSCOPE */}
      <group position={[0, 0.58, 0]}>
        <mesh geometry={stethGeom}>
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00B4D8"
            emissiveIntensity={2.0}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>
        <mesh position={[0.06, -0.22, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.02, 24]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#00FFFF"
            emissiveIntensity={3.2}
          />
        </mesh>
        <pointLight
          position={[0.06, -0.22, 0.36]}
          color="#00FFFF"
          intensity={2.5}
          distance={1.4}
        />
      </group>

      {/* 3D Physician Diagnostic Tablet held in front */}
      <group position={[0.05, 0.42, 0.36]} rotation={[-0.4, 0, 0]}>
        {/* Tablet Bezel */}
        <mesh>
          <boxGeometry args={[0.34, 0.22, 0.015]} />
          <meshStandardMaterial color="#040C1A" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Glowing Screen */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.31, 0.19]} />
          <meshBasicMaterial color="#00E5FF" />
        </mesh>
      </group>

      {/* Sparkling Brain Neural Constellation */}
      <points ref={neuralPointsRef} geometry={neuralPoints}>
        <pointsMaterial
          size={0.045}
          color="#00FFFF"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* CAD Marker Bracket [ 01 00 ] */}
      <Billboard position={[0.85, 0.25, 0.2]}>
        <Text fontSize={0.08} color="#00FFFF" anchorX="center">
          [ 01 00 ] • AI NEXUS
        </Text>
      </Billboard>
    </group>
  );
}

// =========================================================================
// 3. LUMINOUS ORBITAL DATA ARC (Energy Bridge with Traveling Comet)
// =========================================================================
function OrbitalTelemetryArc({
  speed = 1.0,
}: {
  speed: number;
}) {
  const cometRef = useRef<THREE.Group>(null);
  const trailsRef = useRef<THREE.Group>(null);

  const trajectoryCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.0, 0.76, 0.2),
      new THREE.Vector3(-1.3, 1.65, 0.05),
      new THREE.Vector3(0.0, 1.95, -0.2),
      new THREE.Vector3(1.3, 1.65, 0.05),
      new THREE.Vector3(2.0, 0.72, 0.2),
    ]);
  }, []);

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(trajectoryCurve, 90, 0.024, 12, false),
    [trajectoryCurve]
  );

  const glowTubeGeometry = useMemo(
    () => new THREE.TubeGeometry(trajectoryCurve, 90, 0.065, 12, false),
    [trajectoryCurve]
  );

  const tickSegments = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 42;
    for (let i = 0; i <= count; i++) {
      const u = i / count;
      const pt = trajectoryCurve.getPointAt(u);
      const tangent = trajectoryCurve.getTangentAt(u);
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();

      pts.push(pt.clone().add(normal.clone().multiplyScalar(0.03)));
      pts.push(pt.clone().add(normal.clone().multiplyScalar(0.14)));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    return geom;
  }, [trajectoryCurve]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.45 * speed;
    const progress = t % 1;

    if (cometRef.current) {
      const pt = trajectoryCurve.getPointAt(progress);
      cometRef.current.position.copy(pt);
    }

    if (trailsRef.current) {
      const children = trailsRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const offset = (progress - (i + 1) * 0.022 + 1) % 1;
        const pt = trajectoryCurve.getPointAt(offset);
        children[i].position.copy(pt);
      }
    }
  });

  return (
    <group>
      <mesh geometry={glowTubeGeometry}>
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.85} />
      </mesh>

      <lineSegments geometry={tickSegments}>
        <lineBasicMaterial color="#00FFFF" transparent opacity={0.6} />
      </lineSegments>

      {/* TRAVELING COMET LIGHT PACKET */}
      <group ref={cometRef}>
        <mesh>
          <sphereGeometry args={[0.08, 20, 20]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial
            color="#00FFFF"
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <pointLight color="#00FFFF" intensity={4.5} distance={2.5} />
      </group>

      <group ref={trailsRef}>
        {[0.07, 0.06, 0.05, 0.04, 0.03, 0.02].map((size, idx) => (
          <mesh key={idx}>
            <sphereGeometry args={[size, 10, 10]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.6 - idx * 0.09}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// =========================================================================
// 4. FLOATING 3D GLASS HEXAGONAL MEDICAL MODULES (Center Honeycomb)
// =========================================================================
function FloatingHexagonNode({
  data,
  isSelected,
  onSelect,
}: {
  data: HexagonData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const hexRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const Icon = data.icon;

  const hexGeometry = useMemo(() => new THREE.CylinderGeometry(0.32, 0.32, 0.08, 6), []);
  const hexEdges = useMemo(() => new THREE.EdgesGeometry(hexGeometry), [hexGeometry]);

  useFrame((state) => {
    if (hexRef.current) {
      const t = state.clock.getElapsedTime();
      const wave = Math.sin(t * 1.8 + data.pos[0] * 2.5) * 0.04;
      hexRef.current.position.y = data.pos[1] + wave;

      const targetScale = hovered || isSelected ? 1.2 : 1.0;
      hexRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.14
      );
    }
  });

  return (
    <group
      ref={hexRef}
      position={data.pos}
      rotation={[Math.PI / 2, 0, Math.PI / 6]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data.id);
      }}
    >
      <mesh geometry={hexGeometry}>
        <meshPhysicalMaterial
          color="#04182E"
          emissive={hovered || isSelected ? "#00E5FF" : "#022B48"}
          emissiveIntensity={hovered || isSelected ? 1.6 : 0.65}
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={0.82}
        />
      </mesh>

      <lineSegments geometry={hexEdges}>
        <lineBasicMaterial
          color={hovered || isSelected ? "#FFFFFF" : data.color}
          linewidth={2}
        />
      </lineSegments>

      <Billboard position={[0, 0, 0.07]}>
        <Html transform distanceFactor={5.5} style={{ pointerEvents: "none" }}>
          <div
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${
              hovered || isSelected
                ? "bg-[#00E5FF]/25 shadow-[0_0_25px_rgba(0,229,255,0.9)] scale-110"
                : "bg-transparent"
            }`}
          >
            <Icon
              className={`w-6 h-6 transition-colors duration-200 ${
                hovered || isSelected ? "text-white" : "text-[#00E5FF]"
              }`}
            />
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

// =========================================================================
// 5. 3D CYBER PERSPECTIVE FLOOR & GROUND DATA VISUALIZATIONS
// =========================================================================
function CyberPerspectiveFloor() {
  const radarOuterRef = useRef<THREE.Mesh>(null);
  const radarInnerRef = useRef<THREE.Mesh>(null);
  const sweepBarRef = useRef<THREE.Group>(null);
  const barsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (radarOuterRef.current) {
      radarOuterRef.current.rotation.z += delta * 0.25;
    }
    if (radarInnerRef.current) {
      radarInnerRef.current.rotation.z -= delta * 0.45;
    }
    if (sweepBarRef.current) {
      sweepBarRef.current.rotation.z += delta * 0.6;
    }
    if (barsRef.current) {
      const t = state.clock.getElapsedTime();
      const children = barsRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const h = 0.15 + Math.sin(t * 3.5 + i * 0.6) * 0.12;
        children[i].scale.y = Math.max(0.2, h * 5);
      }
    }
  });

  return (
    <group position={[0, -1.45, 0]}>
      <gridHelper
        args={[16, 32, "#00E5FF", "#0A2540"]}
        position={[0, -0.01, 0]}
      />

      {/* CONCENTRIC RADAR RINGS & SWEEPING BEAM */}
      <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={radarOuterRef}>
          <ringGeometry args={[2.4, 2.46, 64]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh ref={radarInnerRef}>
          <ringGeometry args={[1.7, 1.74, 48]} />
          <meshBasicMaterial
            color="#12CDB5"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        <group ref={sweepBarRef}>
          <mesh>
            <circleGeometry args={[2.4, 32, 0, Math.PI / 4]} />
            <meshBasicMaterial
              color="#00FFFF"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        <mesh>
          <ringGeometry args={[0.9, 0.94, 32]} />
          <meshBasicMaterial
            color="#00FFFF"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 3D HOLOGRAPHIC DATA CONES (Coordinates 5.232145 & 8.235687) */}
      <group position={[1.4, 0.25, 1.2]}>
        <mesh>
          <coneGeometry args={[0.22, 0.55, 16]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00B4D8"
            emissiveIntensity={1.4}
            transparent
            opacity={0.7}
          />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.ConeGeometry(0.22, 0.55, 8)]} />
          <lineBasicMaterial color="#FFFFFF" />
        </lineSegments>
        <Billboard position={[0, 0.44, 0]}>
          <Text fontSize={0.08} color="#00FFFF" anchorX="center">
            5.232145
          </Text>
        </Billboard>
      </group>

      <group position={[1.9, 0.15, 0.8]}>
        <mesh>
          <coneGeometry args={[0.16, 0.38, 16]} />
          <meshStandardMaterial
            color="#12CDB5"
            emissive="#0D9488"
            emissiveIntensity={1.2}
            transparent
            opacity={0.65}
          />
        </mesh>
        <Billboard position={[0, 0.32, 0]}>
          <Text fontSize={0.07} color="#94A3B8" anchorX="center">
            8.235687
          </Text>
        </Billboard>
      </group>

      {/* 3D HOLOGRAPHIC CYLINDRICAL PIE CHART */}
      <group position={[-0.9, 0.08, 1.1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry
            args={[0.34, 0.34, 0.09, 24, 1, false, 0, Math.PI * 0.7]}
          />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00B4D8"
            emissiveIntensity={1.3}
          />
        </mesh>
        <mesh position={[0.04, 0.04, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry
            args={[0.34, 0.34, 0.13, 24, 1, false, Math.PI * 0.75, Math.PI * 0.4]}
          />
          <meshStandardMaterial
            color="#14F195"
            emissive="#10B981"
            emissiveIntensity={1.5}
          />
        </mesh>
        <Billboard position={[0, 0.3, 0]}>
          <Text fontSize={0.07} color="#00FFFF" anchorX="center">
            35% • TELEMETRY
          </Text>
        </Billboard>
      </group>

      {/* 3D Equalizer Pulse Bars on Floor */}
      <group ref={barsRef} position={[-2.4, 0.1, 0.8]}>
        {[-0.24, -0.12, 0, 0.12, 0.24].map((x, idx) => (
          <mesh key={idx} position={[x, 0.1, 0]}>
            <boxGeometry args={[0.06, 0.2, 0.06]} />
            <meshStandardMaterial
              color="#00E5FF"
              emissive="#00FFFF"
              emissiveIntensity={1.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// =========================================================================
// 6. AMBIENT CYBER PARTICLES (Drifting Matrix Dust)
// =========================================================================
function AmbientCyberParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const particleData = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 9;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.025;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef} geometry={particleData}>
      <pointsMaterial
        size={0.04}
        color="#00E5FF"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// =========================================================================
// 7. CAMERA PRESET CONTROLLER (Cinematic Transitions with Meaningful Framing)
// =========================================================================
function CameraController({
  preset,
  autoRotate,
}: {
  preset: CameraPreset;
  autoRotate: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const targetCoords = useMemo(() => {
    switch (preset) {
      case "patient":
        return {
          pos: new THREE.Vector3(-1.4, 0.65, 2.7),
          look: new THREE.Vector3(-1.9, 0.65, 0),
        };
      case "doctor":
        return {
          pos: new THREE.Vector3(1.4, 0.65, 2.7),
          look: new THREE.Vector3(2.0, 0.65, 0),
        };
      case "telemetry":
        return {
          pos: new THREE.Vector3(0, 0.85, 3.1),
          look: new THREE.Vector3(0, 0.75, 0),
        };
      case "overview":
      default:
        return {
          pos: new THREE.Vector3(0, 0.35, 4.6),
          look: new THREE.Vector3(0, 0.15, 0),
        };
    }
  }, [preset]);

  useFrame(() => {
    camera.position.lerp(targetCoords.pos, 0.05);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetCoords.look, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={2.2}
      maxDistance={7.5}
      minPolarAngle={Math.PI / 4.2}
      maxPolarAngle={Math.PI / 1.88}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      dampingFactor={0.06}
    />
  );
}

// =========================================================================
// 8. LIVE ANIMATED EKG MONITOR SVG COMPONENT
// =========================================================================
function LiveEkgWaveform() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((prev) => (prev + 3) % 200);
    }, 40);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-14 bg-[#020A16] rounded-xl overflow-hidden border border-[#00E5FF]/20 flex items-center px-2">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,229,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,229,255,0.06)_1px,transparent_1px)] bg-[size:10px_10px]" />
      
      <svg className="w-full h-full relative z-10" viewBox="0 0 200 50" preserveAspectRatio="none">
        <path
          d="M 0,25 L 20,25 L 25,20 L 30,25 L 35,25 L 40,8 L 45,42 L 50,22 L 55,27 L 60,25 L 90,25 L 110,25 L 115,20 L 120,25 L 125,25 L 130,8 L 135,42 L 140,22 L 145,27 L 150,25 L 200,25"
          fill="none"
          stroke="#00FFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Sweeping scanhead line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent shadow-[0_0_8px_#00FFFF] pointer-events-none"
        style={{ left: `${(offset / 200) * 100}%` }}
      />
    </div>
  );
}

// =========================================================================
// 9. ROOT EXPORT: EXTRAORDINARY HOLOGRAPHIC MEDICAL HERO 3D STAGE
// =========================================================================
export const HolographicVectorHero3D: React.FC = () => {
  const [selectedHex, setSelectedHex] = useState<string>("cardio");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("overview");
  const [organFocus, setOrganFocus] = useState<OrganFocus>("heart");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showBackdrop, setShowBackdrop] = useState<boolean>(true);

  const activeHexData = useMemo(() => {
    return HEX_MODULES.find((h) => h.id === selectedHex) || HEX_MODULES[0];
  }, [selectedHex]);

  return (
    <div className="relative w-full h-[640px] sm:h-[700px] lg:h-[760px] rounded-3xl bg-[#020816] overflow-hidden border border-[#00E5FF]/25 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(0,229,255,0.2)] select-none">
      {/* AUTHENTIC VECTOR BACKDROP LAYER */}
      {showBackdrop && (
        <div
          className="absolute inset-0 bg-center bg-cover pointer-events-none opacity-30 mix-blend-screen transition-opacity duration-700"
          style={{
            backgroundImage: "url('/images/hero-vector.png')",
            filter: "contrast(1.25) brightness(0.95)",
          }}
        />
      )}

      {/* Volumetric Radial Lighting Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#020816_90%)] pointer-events-none z-10" />

      {/* ========================================================= */}
      {/* TOP SCI-FI HUD HEADER BAR                                 */}
      {/* ========================================================= */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between bg-gradient-to-b from-[#020816]/95 to-transparent border-b border-white/5 backdrop-blur-md">
        {/* Left Status Pill */}
        <div className="flex items-center gap-2.5 font-mono text-[11px]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5FF]" />
          </span>
          <span className="text-white font-bold tracking-wide">
            HOLOGRAPHIC MEDICAL INTELLIGENCE
          </span>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 text-[10px] font-bold">
            SYSTEM LINK: ACTIVE (99.8%)
          </span>
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center gap-2">
          {/* Backdrop Toggle */}
          <button
            onClick={() => setShowBackdrop(!showBackdrop)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono transition-all duration-200 border flex items-center gap-1.5 ${
              showBackdrop
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.35)]"
                : "bg-white/5 text-white/50 border-white/10 hover:text-white"
            }`}
            title="Toggle authentic vector art backdrop blend"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vector Layer</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono transition-all duration-200 border flex items-center gap-1.5 ${
              autoRotate
                ? "bg-[#12CDB5]/20 text-[#12CDB5] border-[#12CDB5]/40"
                : "bg-white/5 text-white/50 border-white/10 hover:text-white"
            }`}
            title="Toggle subtle 3D camera rotation"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`}
              style={{ animationDuration: "12s" }}
            />
            <span className="hidden sm:inline">3D Orbit</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3D WEBGL CANVAS STAGE                                      */}
      {/* ========================================================= */}
      <Canvas
        camera={{ position: [0, 0.35, 4.6], fov: 48 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={["#020816"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 7, 5]} intensity={1.5} color="#FFFFFF" />
        <directionalLight position={[-6, 4, -2]} intensity={1.0} color="#00E5FF" />
        <pointLight position={[0, 2.5, 2]} intensity={2.0} color="#00E5FF" />

        {/* 1. Left: Solid & Contoured Holographic Patient with Organs */}
        <HolographicPatient
          isHovered={cameraPreset === "patient"}
          organFocus={organFocus}
          onSelectOrgan={setOrganFocus}
        />

        {/* 2. Right: Solid & Contoured Doctor with Stethoscope & Tablet */}
        <HolographicDoctor
          isHovered={cameraPreset === "doctor"}
        />

        {/* 3. Luminous Orbital Telemetry Arc */}
        <OrbitalTelemetryArc speed={1.25} />

        {/* 4. Center: Honeycomb of 7 Floating 3D Medical Hexagons */}
        <group>
          {HEX_MODULES.map((hex) => (
            <FloatingHexagonNode
              key={hex.id}
              data={hex}
              isSelected={selectedHex === hex.id}
              onSelect={setSelectedHex}
            />
          ))}
        </group>

        {/* 5. Cyber Perspective Floor & Holographic Radar / Cones / Pie Chart */}
        <CyberPerspectiveFloor />

        {/* 6. Ambient Matrix Cyber Particles */}
        <AmbientCyberParticles />

        {/* 7. Camera & Orbit Controller */}
        <CameraController preset={cameraPreset} autoRotate={autoRotate} />
      </Canvas>

      {/* ========================================================= */}
      {/* MEANINGFUL DYNAMIC HUD PANELS (Revealed on Mode / Zoom)    */}
      {/* ========================================================= */}

      {/* 1. PATIENT DIGITAL TWIN INSPECTION PANEL (When in Patient Mode) */}
      {cameraPreset === "patient" && (
        <div className="absolute top-16 left-4 sm:left-6 z-20 w-[280px] sm:w-[320px] bg-[#020A16]/95 backdrop-blur-2xl border border-[#00E5FF]/40 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,229,255,0.35)] animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping" />
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                PATIENT DIGITAL TWIN
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-mono font-bold">
              SYNCED
            </span>
          </div>

          {/* Organ Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {[
              { id: "heart", label: "Heart", icon: Heart },
              { id: "lungs", label: "Lungs", icon: Wind },
              { id: "brain", label: "Brain", icon: Brain },
              { id: "vitals", label: "Vitals", icon: Gauge },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const active = organFocus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setOrganFocus(tab.id as OrganFocus)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-mono transition-all duration-200 border ${
                    active
                      ? "bg-[#00E5FF]/20 text-white border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                      : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${active ? "text-[#00FFFF]" : "text-white/60"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Content based on selected organ */}
          {organFocus === "heart" && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-white/70 mb-1">
                  <span>LIVE 12-LEAD EKG STREAM</span>
                  <span className="text-[#00FFFF] font-bold">74 BPM</span>
                </div>
                <LiveEkgWaveform />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="text-white/50 block text-[9px]">BLOOD PRESSURE</span>
                  <span className="text-white font-bold text-xs">120/80 mmHg</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="text-white/50 block text-[9px]">RHYTHM</span>
                  <span className="text-emerald-400 font-bold text-xs">Regular Sinus</span>
                </div>
              </div>
            </div>
          )}

          {organFocus === "lungs" && (
            <div className="space-y-2.5 font-mono text-[10px]">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-white/70">O2 SATURATION (SPO2):</span>
                <span className="text-emerald-400 font-bold text-sm">99%</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-white/70">RESPIRATION RATE:</span>
                <span className="text-[#00FFFF] font-bold text-sm">16 / min</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-white/70">TIDAL VOLUME:</span>
                <span className="text-white font-bold text-sm">500 mL</span>
              </div>
            </div>
          )}

          {organFocus === "brain" && (
            <div className="space-y-2.5 font-mono text-[10px]">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-white/70">EEG ALPHA WAVE:</span>
                <span className="text-[#00FFFF] font-bold text-sm">10.2 Hz</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-white/70">COGNITIVE INDEX:</span>
                <span className="text-emerald-400 font-bold text-sm">94 / 100</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-white/70">SYNAPSE LATENCY:</span>
                <span className="text-white font-bold text-sm">12 ms</span>
              </div>
            </div>
          )}

          {organFocus === "vitals" && (
            <div className="space-y-2 font-mono text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-white/50 block text-[9px]">BODY TEMP</span>
                  <span className="text-emerald-400 font-bold text-sm">36.8 °C</span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-white/50 block text-[9px]">PERFUSION</span>
                  <span className="text-[#00FFFF] font-bold text-sm">Optimal</span>
                </div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-white/70">PATIENT ID:</span>
                <span className="text-white font-bold">#NK-894-CLINIC</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PHYSICIAN AI CONSOLE PANEL (When in Doctor Mode) */}
      {cameraPreset === "doctor" && (
        <div className="absolute top-16 right-4 sm:right-6 z-20 w-[290px] sm:w-[330px] bg-[#020A16]/95 backdrop-blur-2xl border border-[#00E5FF]/40 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,229,255,0.35)] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#00FFFF]" />
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                PHYSICIAN AI WORKSTATION
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
              ONLINE
            </span>
          </div>

          <div className="space-y-3 font-mono text-[10px]">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex justify-between text-white/70">
                <span>ACTIVE CASE:</span>
                <span className="text-white font-bold">John Doe (42y • M)</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>DIAGNOSTIC ACCURACY:</span>
                <span className="text-emerald-400 font-bold">99.4% Verified</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>EMR PROTOCOL:</span>
                <span className="text-[#00FFFF] font-bold">HL7 / FHIR R4</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 space-y-1">
              <div className="text-[10px] font-bold text-[#00FFFF] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00FFFF]" />
                AI CLINICAL RECOMMENDATION
              </div>
              <p className="text-[10px] text-white/80 leading-relaxed">
                Vital parameters remain in target range. Zero negative contraindications detected across current 3 e-prescriptions.
              </p>
            </div>

            <div className="pt-1 flex gap-2">
              <button className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#12CDB5] text-[#040810] font-bold text-[10px] hover:opacity-90 transition-opacity">
                Review e-Rx
              </button>
              <button className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-[10px] transition-colors border border-white/10">
                Open EHR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. HEXAGON MODULE DETAIL PANEL (When in Telemetry Mode or Hexagon Selected) */}
      {(cameraPreset === "telemetry" || cameraPreset === "overview") && (
        <div className="absolute top-16 right-4 sm:right-6 z-20 w-[270px] sm:w-[310px] bg-[#020A16]/95 backdrop-blur-2xl border border-[#00E5FF]/30 rounded-2xl p-4 shadow-[0_0_35px_rgba(0,229,255,0.3)] hidden sm:block">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
            <span className="text-[10px] font-mono font-bold text-[#00E5FF] tracking-wider uppercase">
              {activeHexData.category}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
              {activeHexData.metric}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white mb-1">{activeHexData.name}</h4>
          <p className="text-[11px] text-[#94A3B8] leading-tight mb-3">
            {activeHexData.subtitle}
          </p>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1 font-mono text-[10px]">
            <div className="flex justify-between text-white/70">
              <span>TELEMETRY:</span>
              <span className="text-[#00FFFF] font-bold">{activeHexData.stats}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>ENTERPRISE SUITE:</span>
              <span className="text-[#14F195] font-bold">{activeHexData.productRef}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BOTTOM SCI-FI CONTROLS & CAMERA PRESETS                   */}
      {/* ========================================================= */}
      <div className="absolute bottom-3.5 inset-x-3 sm:inset-x-6 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#020816]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 px-4 shadow-2xl">
        {/* Camera Preset Switches */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[10px] font-mono text-white/50 mr-1 hidden sm:inline">
            INSPECTOR VIEW:
          </span>
          {[
            { id: "overview", label: "Full Ecosystem", icon: Maximize2 },
            { id: "patient", label: "Patient Twin (Vitals)", icon: Activity },
            { id: "doctor", label: "Doctor AI (Clinical)", icon: Stethoscope },
            { id: "telemetry", label: "Data Stream", icon: Zap },
          ].map((btn) => {
            const Icon = btn.icon;
            const active = cameraPreset === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setCameraPreset(btn.id as CameraPreset)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-[#00E5FF] to-[#12CDB5] text-[#040810] font-bold shadow-[0_0_20px_rgba(0,229,255,0.45)]"
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interaction Hint */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-white/50">
          <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Switch views to inspect live organs, EKG waveforms, and AI doctor console</span>
        </div>
      </div>
    </div>
  );
};

export default HolographicVectorHero3D;
