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
  Radio,
  Layers,
  RotateCcw,
  Zap,
  CheckCircle2,
  Cpu,
} from "lucide-react";

// =========================================================================
// TYPES & METADATA
// =========================================================================
export type CameraPreset = "overview" | "patient" | "doctor" | "telemetry";

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
}

const HEX_MODULES: HexagonData[] = [
  {
    id: "cardio",
    name: "Cardiovascular Telemetry",
    subtitle: "Real-time hemodynamic & EKG streaming",
    category: "VITAL TELEMETRY",
    icon: Activity,
    pos: [0, 0.45, 0.15],
    color: "#00E5FF",
    glow: "#00E5FF",
    stats: "74 BPM • Sinus Regular",
  },
  {
    id: "genomics",
    name: "Genomic Sequencing",
    subtitle: "Precision biomarker & DNA profile sync",
    category: "MOLECULAR BIOLOGY",
    icon: Dna,
    pos: [-0.68, 0.85, 0.05],
    color: "#12CDB5",
    glow: "#12CDB5",
    stats: "HLA-B27 Negative • 99.4%",
  },
  {
    id: "neuro",
    name: "Neural Diagnostics",
    subtitle: "Cognitive assessment & EEG telemetry",
    category: "AI NEUROLOGY",
    icon: Brain,
    pos: [0.68, 0.85, 0.05],
    color: "#38BDF8",
    glow: "#00E5FF",
    stats: "Alpha Wave 10.2 Hz • Synced",
  },
  {
    id: "clinical",
    name: "Clinical Core Care",
    subtitle: "Hospital-wide EMR & Inpatient workflow",
    category: "CLINICAL SYSTEMS",
    icon: Cross,
    pos: [0, 1.25, -0.05],
    color: "#43E6D0",
    glow: "#43E6D0",
    stats: "HL7 / FHIR Verified • Active",
  },
  {
    id: "pharmacy",
    name: "Smart Pharmacotherapy",
    subtitle: "Automated dosing & drug interaction AI",
    category: "PHARMACEUTICAL",
    icon: Pill,
    pos: [0.68, 0.05, 0.05],
    color: "#00E5FF",
    glow: "#12CDB5",
    stats: "3 Active Prescriptions • Safe",
  },
  {
    id: "therapeutics",
    name: "Precision Therapeutics",
    subtitle: "Targeted delivery & infusion telemetry",
    category: "THERAPEUTICS",
    icon: Syringe,
    pos: [-0.68, 0.05, 0.05],
    color: "#14F195",
    glow: "#14F195",
    stats: "Rate: 25 ml/hr • Steady",
  },
  {
    id: "biochem",
    name: "Biochemical Pathology",
    subtitle: "Sub-second lab analyzer telemetry",
    category: "LAB DIAGNOSTICS",
    icon: Atom,
    pos: [0, -0.35, 0.15],
    color: "#60A5FA",
    glow: "#38BDF8",
    stats: "Biomarker Matrix 100% Calibrated",
  },
];

// =========================================================================
// 1. HOLOGRAPHIC PATIENT (Human Wireframe & Point-Cloud Digital Twin)
// =========================================================================
function HolographicPatient({
  isHovered,
  onHover,
}: {
  isHovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const patientGroup = useRef<THREE.Group>(null);
  const heartCoreRef = useRef<THREE.Mesh>(null);
  const heartGlowLightRef = useRef<THREE.PointLight>(null);
  const scanRingRef = useRef<THREE.Group>(null);

  // Common high-tech holographic wireframe & glow materials
  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#00E5FF",
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      }),
    []
  );

  const innerCyanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#053047",
        emissive: "#00B4D8",
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.45,
        roughness: 0.3,
        metalness: 0.8,
      }),
    []
  );

  // Discrete glowing vertex particles for anatomical joints
  const jointPoints = useMemo(() => {
    const coords: number[] = [
      // Head / Cranium
      -1.9, 1.35, 0,
      -1.9, 1.48, 0.1,
      -1.9, 1.25, 0.12,
      // Neck & Spine
      -1.9, 1.05, 0,
      -1.9, 0.85, -0.05,
      -1.9, 0.65, -0.05,
      -1.9, 0.45, -0.05,
      -1.9, 0.25, 0,
      // Shoulders & Clavicle
      -2.28, 0.95, 0,
      -1.52, 0.95, 0,
      // Chest & Heart
      -1.9, 0.75, 0.15,
      -2.02, 0.68, 0.18, // Heart core
      // Arms (Abducted avatar stance)
      -2.5, 0.62, 0.05,
      -1.3, 0.62, 0.05,
      -2.72, 0.28, 0.1,
      -1.08, 0.28, 0.1,
      -2.9, -0.08, 0.15,
      -0.9, -0.08, 0.15,
      // Pelvis / Hips
      -2.06, 0.15, 0,
      -1.74, 0.15, 0,
      // Knees
      -2.08, -0.55, 0.04,
      -1.72, -0.55, 0.04,
      // Feet on floor
      -2.12, -1.25, 0.08,
      -1.68, -1.25, 0.08,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
    return geom;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Subtle breathing chest expansion & float
    if (patientGroup.current) {
      const breath = Math.sin(t * 1.5) * 0.015;
      patientGroup.current.position.y = breath;
    }

    // Realistic double-pulse heartbeat (lub-dub)
    const beat = (t * 2.1) % 1;
    let pulse = 0;
    if (beat < 0.14) {
      pulse = Math.sin((beat / 0.14) * Math.PI) * 0.35;
    } else if (beat > 0.18 && beat < 0.32) {
      pulse = Math.sin(((beat - 0.18) / 0.14) * Math.PI) * 0.22;
    }

    if (heartCoreRef.current) {
      const s = 1 + pulse + (isHovered ? 0.25 : 0);
      heartCoreRef.current.scale.set(s, s, s);
      const mat = heartCoreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2.0 + pulse * 4.0;
    }

    if (heartGlowLightRef.current) {
      heartGlowLightRef.current.intensity = 2.5 + pulse * 6.0;
    }

    // Sweeping diagnostic scanner ring moving vertically
    if (scanRingRef.current) {
      scanRingRef.current.position.y = -0.1 + Math.sin(t * 2.0) * 1.35;
    }
  });

  return (
    <group
      ref={patientGroup}
      position={[-1.9, 0, 0]}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
        onHover(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        onHover(false);
      }}
    >
      {/* ---- CRANIUM & HEAD ---- */}
      <group position={[0, 1.38, 0]}>
        <mesh material={innerCyanMat}>
          <sphereGeometry args={[0.22, 24, 24]} />
        </mesh>
        <mesh material={wireMat}>
          <icosahedronGeometry args={[0.23, 2]} />
        </mesh>
        {/* Glowing Neural Visor / Diagnostic line */}
        <mesh position={[0, 0.04, 0.2]}>
          <boxGeometry args={[0.26, 0.04, 0.06]} />
          <meshBasicMaterial color="#00FFFF" />
        </mesh>
        <pointLight color="#00E5FF" intensity={1.5} distance={1.2} />
      </group>

      {/* ---- NECK ---- */}
      <mesh position={[0, 1.08, 0]} material={wireMat}>
        <cylinderGeometry args={[0.09, 0.11, 0.18, 12]} />
      </mesh>

      {/* ---- TORSO & RIBCAGE ---- */}
      <group position={[0, 0.65, 0]}>
        {/* Upper Chest Shell */}
        <mesh position={[0, 0.18, 0]} material={innerCyanMat}>
          <boxGeometry args={[0.62, 0.44, 0.28]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} material={wireMat}>
          <boxGeometry args={[0.64, 0.46, 0.3]} />
        </mesh>

        {/* Ribcage wire rings */}
        {[-0.04, 0.06, 0.16, 0.26].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.26 - i * 0.015, 0.008, 8, 24]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.7} />
          </mesh>
        ))}

        {/* RADIANT BEATING HEART (Patient Cardiac Core) */}
        <group position={[-0.12, 0.14, 0.12]}>
          <mesh ref={heartCoreRef}>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshStandardMaterial
              color="#00FFFF"
              emissive="#00FFFF"
              emissiveIntensity={2.8}
              roughness={0.1}
            />
          </mesh>
          {/* Outer Pulsing Corona */}
          <mesh>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial
              color="#00E5FF"
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
          <pointLight
            ref={heartGlowLightRef}
            color="#00FFFF"
            distance={2.5}
            intensity={3.0}
          />
        </group>

        {/* Lower Torso & Abdomen */}
        <mesh position={[0, -0.22, 0]} material={innerCyanMat}>
          <cylinderGeometry args={[0.24, 0.21, 0.36, 16]} />
        </mesh>
        <mesh position={[0, -0.22, 0]} material={wireMat}>
          <cylinderGeometry args={[0.25, 0.22, 0.36, 12]} />
        </mesh>

        {/* Central Glowing Spinal Nodes */}
        {[-0.32, -0.18, -0.04, 0.1, 0.24].map((y, idx) => (
          <mesh key={idx} position={[0, y, -0.1]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#00E5FF" />
          </mesh>
        ))}
      </group>

      {/* ---- SHOULDERS & ARMS (Clinical Avatar Posture) ---- */}
      {/* Left Arm */}
      <group position={[-0.38, 0.88, 0]}>
        {/* Shoulder node */}
        <mesh material={wireMat}>
          <sphereGeometry args={[0.11, 12, 12]} />
        </mesh>
        {/* Upper Arm */}
        <mesh
          position={[-0.18, -0.25, 0.04]}
          rotation={[0, 0, 0.3]}
          material={wireMat}
        >
          <cylinderGeometry args={[0.07, 0.06, 0.46, 10]} />
        </mesh>
        {/* Elbow node */}
        <mesh position={[-0.32, -0.5, 0.08]} material={wireMat}>
          <sphereGeometry args={[0.07, 10, 10]} />
        </mesh>
        {/* Forearm & Hand */}
        <mesh
          position={[-0.45, -0.82, 0.12]}
          rotation={[0, 0, 0.25]}
          material={wireMat}
        >
          <cylinderGeometry args={[0.055, 0.045, 0.45, 10]} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.38, 0.88, 0]}>
        {/* Shoulder node */}
        <mesh material={wireMat}>
          <sphereGeometry args={[0.11, 12, 12]} />
        </mesh>
        {/* Upper Arm */}
        <mesh
          position={[0.18, -0.25, 0.04]}
          rotation={[0, 0, -0.3]}
          material={wireMat}
        >
          <cylinderGeometry args={[0.07, 0.06, 0.46, 10]} />
        </mesh>
        {/* Elbow node */}
        <mesh position={[0.32, -0.5, 0.08]} material={wireMat}>
          <sphereGeometry args={[0.07, 10, 10]} />
        </mesh>
        {/* Forearm & Hand */}
        <mesh
          position={[0.45, -0.82, 0.12]}
          rotation={[0, 0, -0.25]}
          material={wireMat}
        >
          <cylinderGeometry args={[0.055, 0.045, 0.45, 10]} />
        </mesh>
      </group>

      {/* ---- PELVIS & HIPS ---- */}
      <mesh position={[0, 0.22, 0]} material={wireMat}>
        <cylinderGeometry args={[0.22, 0.26, 0.22, 12]} />
      </mesh>

      {/* ---- LEGS ---- */}
      {/* Left Leg */}
      <group position={[-0.16, 0.08, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.35, 0]} material={wireMat}>
          <cylinderGeometry args={[0.09, 0.075, 0.58, 10]} />
        </mesh>
        {/* Knee Node */}
        <mesh position={[0, -0.68, 0.02]} material={wireMat}>
          <sphereGeometry args={[0.08, 10, 10]} />
        </mesh>
        {/* Calf */}
        <mesh position={[0, -1.05, 0]} material={wireMat}>
          <cylinderGeometry args={[0.07, 0.055, 0.6, 10]} />
        </mesh>
        {/* Foot on grid */}
        <mesh position={[0, -1.38, 0.06]} material={wireMat}>
          <boxGeometry args={[0.09, 0.06, 0.22]} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.16, 0.08, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.35, 0]} material={wireMat}>
          <cylinderGeometry args={[0.09, 0.075, 0.58, 10]} />
        </mesh>
        {/* Knee Node */}
        <mesh position={[0, -0.68, 0.02]} material={wireMat}>
          <sphereGeometry args={[0.08, 10, 10]} />
        </mesh>
        {/* Calf */}
        <mesh position={[0, -1.05, 0]} material={wireMat}>
          <cylinderGeometry args={[0.07, 0.055, 0.6, 10]} />
        </mesh>
        {/* Foot on grid */}
        <mesh position={[0, -1.38, 0.06]} material={wireMat}>
          <boxGeometry args={[0.09, 0.06, 0.22]} />
        </mesh>
      </group>

      {/* Joint Points Particle Overlay */}
      <points geometry={jointPoints}>
        <pointsMaterial
          size={0.07}
          color="#00FFFF"
          transparent
          opacity={0.9}
        />
      </points>

      {/* SWEEPING LASER SCANNER RING */}
      <group ref={scanRingRef} position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.012, 12, 48]} />
          <meshBasicMaterial color="#00FFFF" />
        </mesh>
        {/* Planar Laser Beam Sheet */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.54, 32]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight color="#00FFFF" intensity={1.8} distance={1.2} />
      </group>

      {/* Circular HUD Reticle Above Shoulder ("Ready" & "79%") */}
      <Billboard position={[-0.7, 1.4, 0]}>
        <group>
          {/* Outer Tick Ring */}
          <mesh>
            <ringGeometry args={[0.26, 0.28, 32]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[0.18, 0.19, 24]} />
            <meshBasicMaterial
              color="#12CDB5"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Text
            position={[0, 0.04, 0.01]}
            fontSize={0.07}
            color="#00FFFF"
            anchorX="center"
            anchorY="middle"
          >
            Ready
          </Text>
          <Text
            position={[0, -0.06, 0.01]}
            fontSize={0.06}
            color="#94A3B8"
            anchorX="center"
            anchorY="middle"
          >
            79%
          </Text>
        </group>
      </Billboard>

      {/* Floating Biometric Vitals Card */}
      <Billboard position={[-0.85, 0.2, 0.2]}>
        <Html transform distanceFactor={5} style={{ pointerEvents: "none" }}>
          <div className="bg-[#040C1A]/90 backdrop-blur-md border border-[#00E5FF]/40 rounded-xl p-3 shadow-[0_0_25px_rgba(0,229,255,0.25)] text-left min-w-[140px]">
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-white/10 pb-1">
              <span className="text-[9px] font-mono font-bold text-[#00E5FF] tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
                DIGITAL TWIN
              </span>
              <span className="text-[8px] text-white/60 font-mono">ID: #NK-89</span>
            </div>
            <div className="space-y-1 font-mono text-[9px]">
              <div className="flex justify-between text-white/80">
                <span>HEART RATE:</span>
                <span className="text-[#00FFFF] font-bold">72 BPM</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>O2 SATURATION:</span>
                <span className="text-[#12CDB5] font-bold">99%</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>STATUS:</span>
                <span className="text-emerald-400 font-bold">SYNCED</span>
              </div>
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

// =========================================================================
// 2. HOLOGRAPHIC DOCTOR (Physician Wireframe with Stethoscope & Folded Arms)
// =========================================================================
function HolographicDoctor({
  isHovered,
  onHover,
}: {
  isHovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const doctorGroup = useRef<THREE.Group>(null);
  const neuralConstellationRef = useRef<THREE.Points>(null);

  // High-tech physician blue/cyan wireframe materials
  const docWireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#00E5FF",
        wireframe: true,
        transparent: true,
        opacity: 0.72,
      }),
    []
  );

  const docSolidMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#051D33",
        emissive: "#00527A",
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.45,
        roughness: 0.3,
        metalness: 0.85,
      }),
    []
  );

  // Stethoscope 3D Spline Path
  const stethoscopeCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.48, 0.08), // Left back of neck
      new THREE.Vector3(-0.18, 0.22, 0.26), // Left chest front
      new THREE.Vector3(-0.06, 0.04, 0.32), // Y-Junction
      new THREE.Vector3(0.04, -0.15, 0.34), // Lower tubing towards chestpiece
      new THREE.Vector3(0.06, -0.22, 0.32), // Chestpiece location
      new THREE.Vector3(0.0, 0.02, 0.3),   // Tubing loop
      new THREE.Vector3(0.18, 0.22, 0.26),  // Right chest front
      new THREE.Vector3(0.16, 0.48, 0.08),  // Right back of neck
    ]);
  }, []);

  const stethGeometry = useMemo(() => {
    return new THREE.TubeGeometry(stethoscopeCurve, 48, 0.016, 8, false);
  }, [stethoscopeCurve]);

  // Doctor's Neural Cognitive Point Cloud (Constellation of Clinical AI nodes)
  const docNeuralPoints = useMemo(() => {
    const p: number[] = [];
    const count = 160;
    for (let i = 0; i < count; i++) {
      // Cranium / Head
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.26 + Math.random() * 0.06;
      p.push(
        r * Math.sin(phi) * Math.cos(theta),
        1.38 + r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    // Torso & Lab Coat Constellation
    for (let i = 0; i < 220; i++) {
      const x = (Math.random() - 0.5) * 0.75;
      const y = 0.15 + Math.random() * 0.9;
      const z = (Math.random() - 0.5) * 0.45;
      p.push(x, y, z);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return geom;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (doctorGroup.current) {
      // Gentle breathing float & subtle 3/4 posture shift
      doctorGroup.current.position.y = Math.sin(t * 1.3 + 1.0) * 0.015;
    }

    if (neuralConstellationRef.current) {
      // Sparkle synaptic firing
      const mat = neuralConstellationRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.65 + Math.sin(t * 3.5) * 0.25;
    }
  });

  return (
    <group
      ref={doctorGroup}
      position={[2.1, 0, 0]}
      rotation={[0, -0.35, 0]} // 3/4 turn towards center patient
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
        onHover(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        onHover(false);
      }}
    >
      {/* ---- DOCTOR HEAD & CRANIUM ---- */}
      <group position={[0, 1.38, 0]}>
        <mesh material={docSolidMat}>
          <sphereGeometry args={[0.26, 24, 24]} />
        </mesh>
        <mesh material={docWireMat}>
          <icosahedronGeometry args={[0.275, 2]} />
        </mesh>
        {/* Physician Neural Network Glow Core */}
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.5} />
        </mesh>
        <pointLight color="#00E5FF" intensity={1.8} distance={1.4} />
      </group>

      {/* ---- LAB COAT COLLAR & LAPELS ---- */}
      <group position={[0, 1.06, 0]}>
        {/* Stiff Collar */}
        <mesh material={docWireMat}>
          <cylinderGeometry args={[0.13, 0.16, 0.2, 14]} />
        </mesh>
        {/* Left Lapel */}
        <mesh
          position={[-0.14, -0.12, 0.18]}
          rotation={[0.3, 0.1, -0.25]}
          material={docWireMat}
        >
          <boxGeometry args={[0.12, 0.28, 0.02]} />
        </mesh>
        {/* Right Lapel */}
        <mesh
          position={[0.14, -0.12, 0.18]}
          rotation={[0.3, -0.1, 0.25]}
          material={docWireMat}
        >
          <boxGeometry args={[0.12, 0.28, 0.02]} />
        </mesh>
      </group>

      {/* ---- TORSO & CLINICAL COAT ---- */}
      <group position={[0, 0.62, 0]}>
        {/* Broad Clinical Chest */}
        <mesh position={[0, 0.22, 0]} material={docSolidMat}>
          <boxGeometry args={[0.76, 0.5, 0.38]} />
        </mesh>
        <mesh position={[0, 0.22, 0]} material={docWireMat}>
          <boxGeometry args={[0.78, 0.52, 0.4]} />
        </mesh>

        {/* Coat Mid-Torso */}
        <mesh position={[0, -0.2, 0]} material={docSolidMat}>
          <cylinderGeometry args={[0.32, 0.36, 0.44, 18]} />
        </mesh>
        <mesh position={[0, -0.2, 0]} material={docWireMat}>
          <cylinderGeometry args={[0.33, 0.37, 0.44, 14]} />
        </mesh>
      </group>

      {/* ---- FOLDED / CROSSED ARMS (Exact Stance from Vector Art) ---- */}
      <group position={[0, 0.62, 0.16]}>
        {/* Left Forearm crossing rightward */}
        <mesh
          position={[0.06, -0.06, 0.1]}
          rotation={[0, 0.1, -0.12]}
          material={docSolidMat}
        >
          <cylinderGeometry args={[0.08, 0.07, 0.58, 12]} />
        </mesh>
        <mesh
          position={[0.06, -0.06, 0.1]}
          rotation={[0, 0.1, -0.12]}
          material={docWireMat}
        >
          <cylinderGeometry args={[0.085, 0.075, 0.58, 8]} />
        </mesh>

        {/* Right Forearm crossing underneath leftward */}
        <mesh
          position={[-0.06, -0.18, 0.06]}
          rotation={[0, -0.1, 0.14]}
          material={docSolidMat}
        >
          <cylinderGeometry args={[0.08, 0.07, 0.58, 12]} />
        </mesh>
        <mesh
          position={[-0.06, -0.18, 0.06]}
          rotation={[0, -0.1, 0.14]}
          material={docWireMat}
        >
          <cylinderGeometry args={[0.085, 0.075, 0.58, 8]} />
        </mesh>

        {/* Shoulders */}
        <mesh position={[-0.44, 0.32, -0.06]} material={docWireMat}>
          <sphereGeometry args={[0.13, 12, 12]} />
        </mesh>
        <mesh position={[0.44, 0.32, -0.06]} material={docWireMat}>
          <sphereGeometry args={[0.13, 12, 12]} />
        </mesh>
      </group>

      {/* ---- 3D STETHOSCOPE ---- */}
      <group position={[0, 0.58, 0]}>
        <mesh geometry={stethGeometry}>
          <meshStandardMaterial
            color="#00FFFF"
            emissive="#00B4D8"
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        {/* Glowing Circular Chestpiece */}
        <mesh position={[0.06, -0.22, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 24]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#00E5FF"
            emissiveIntensity={2.2}
          />
        </mesh>
        <pointLight
          position={[0.06, -0.22, 0.35]}
          color="#00E5FF"
          intensity={1.5}
          distance={1.0}
        />
      </group>

      {/* ---- LOWER CLINICAL COAT ---- */}
      <group position={[0, -0.15, 0]}>
        <mesh material={docSolidMat}>
          <cylinderGeometry args={[0.36, 0.46, 0.7, 18]} />
        </mesh>
        <mesh material={docWireMat}>
          <cylinderGeometry args={[0.37, 0.47, 0.7, 12]} />
        </mesh>
      </group>

      {/* NEURAL SYNAPTIC POINT CLOUD */}
      <points ref={neuralConstellationRef} geometry={docNeuralPoints}>
        <pointsMaterial
          size={0.05}
          color="#00FFFF"
          transparent
          opacity={0.8}
        />
      </points>

      {/* Corner Brackets CAD Markers [ 01 00 ] */}
      <Billboard position={[0.75, 0.3, 0.2]}>
        <Html transform distanceFactor={5} style={{ pointerEvents: "none" }}>
          <div className="bg-[#040C1A]/90 backdrop-blur-md border border-[#00E5FF]/40 rounded-xl p-3 shadow-[0_0_25px_rgba(0,229,255,0.25)] text-left min-w-[150px]">
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-white/10 pb-1">
              <span className="text-[9px] font-mono font-bold text-[#00E5FF] tracking-wider flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-[#00E5FF]" />
                PHYSICIAN AI
              </span>
              <span className="text-[8px] text-white/60 font-mono">[ 01 00 ]</span>
            </div>
            <div className="space-y-1 font-mono text-[9px]">
              <div className="flex justify-between text-white/80">
                <span>CLINICAL AI:</span>
                <span className="text-[#00FFFF] font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>DIAGNOSTIC ACC:</span>
                <span className="text-[#12CDB5] font-bold">99.2%</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>TELEMETRY:</span>
                <span className="text-cyan-300 font-bold">STREAMING</span>
              </div>
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

// =========================================================================
// 3. ORBITAL TELEMETRY ARC (Dynamic Data Bridge with Traveling Comet)
// =========================================================================
function OrbitalTelemetryArc({
  speed = 1.0,
}: {
  speed: number;
}) {
  const cometRef = useRef<THREE.Group>(null);
  const trailsRef = useRef<THREE.Group>(null);

  // Smooth sweeping spline from Patient Heart (-1.9, 0.75, 0.2) to Doctor Chest (2.0, 0.7, 0.2)
  const trajectoryCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.9, 0.75, 0.2), // Patient Heart Node
      new THREE.Vector3(-1.2, 1.55, 0.05), // Ascending arc
      new THREE.Vector3(0.0, 1.85, -0.2),  // Apex over hexagons
      new THREE.Vector3(1.2, 1.55, 0.05),  // Descending arc
      new THREE.Vector3(2.0, 0.7, 0.2),   // Doctor Stethoscope / Chest Node
    ]);
  }, []);

  // Continuous extruded glowing tube
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(trajectoryCurve, 80, 0.022, 10, false);
  }, [trajectoryCurve]);

  // Graduation Tick Marks along the arc (matching vector art)
  const tickSegments = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 36;
    for (let i = 0; i <= count; i++) {
      const u = i / count;
      const pt = trajectoryCurve.getPointAt(u);
      const tangent = trajectoryCurve.getTangentAt(u);
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();

      pts.push(pt.clone().add(normal.clone().multiplyScalar(0.02)));
      pts.push(pt.clone().add(normal.clone().multiplyScalar(0.12)));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    return geom;
  }, [trajectoryCurve]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.4 * speed;
    const progress = t % 1;

    // Position main traveling comet packet
    if (cometRef.current) {
      const pt = trajectoryCurve.getPointAt(progress);
      cometRef.current.position.copy(pt);
    }

    // Position trailing ghost packets behind the comet
    if (trailsRef.current) {
      const children = trailsRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const offset = (progress - (i + 1) * 0.025 + 1) % 1;
        const pt = trajectoryCurve.getPointAt(offset);
        children[i].position.copy(pt);
      }
    }
  });

  return (
    <group>
      {/* Primary Luminous Arc Spline */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Graduation Tick Marks along trajectory */}
      <lineSegments geometry={tickSegments}>
        <lineBasicMaterial
          color="#00FFFF"
          transparent
          opacity={0.55}
        />
      </lineSegments>

      {/* TRAVELING COMET LIGHT PACKET */}
      <group ref={cometRef}>
        {/* Core brilliant sphere */}
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* Outer Glow Sphere */}
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial
            color="#00FFFF"
            transparent
            opacity={0.65}
          />
        </mesh>
        <pointLight color="#00FFFF" intensity={4.0} distance={2.2} />
      </group>

      {/* Trailing Comet Spark Trail (Fading spheres) */}
      <group ref={trailsRef}>
        {[0.06, 0.05, 0.04, 0.03, 0.02].map((size, idx) => (
          <mesh key={idx}>
            <sphereGeometry args={[size, 10, 10]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.5 - idx * 0.09}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// =========================================================================
// 4. FLOATING 3D HEXAGONAL MEDICAL MODULES (Center Honeycomb)
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

  // Extruded 6-sided cylinder for 3D hexagonal prism
  const hexGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.3, 0.3, 0.08, 6);
  }, []);

  const hexEdges = useMemo(() => {
    return new THREE.EdgesGeometry(hexGeometry);
  }, [hexGeometry]);

  useFrame((state) => {
    if (hexRef.current) {
      // Gentle floating frequency tailored by id index
      const t = state.clock.getElapsedTime();
      const wave = Math.sin(t * 1.8 + data.pos[0] * 2.0) * 0.035;
      hexRef.current.position.y = data.pos[1] + wave;

      // Slight rotation tilt on hover
      const targetScale = hovered || isSelected ? 1.18 : 1.0;
      hexRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.12
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
      {/* 3D Glass Hexagon Body */}
      <mesh geometry={hexGeometry}>
        <meshStandardMaterial
          color="#061A2E"
          emissive={hovered || isSelected ? "#00B4D8" : "#022944"}
          emissiveIntensity={hovered || isSelected ? 1.4 : 0.6}
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.78}
        />
      </mesh>

      {/* Luminous Neon Edges */}
      <lineSegments geometry={hexEdges}>
        <lineBasicMaterial
          color={hovered || isSelected ? "#FFFFFF" : data.color}
          linewidth={2}
        />
      </lineSegments>

      {/* Embedded High-Contrast Medical Icon via Drei Html */}
      <Billboard position={[0, 0, 0.06]}>
        <Html transform distanceFactor={5.5} style={{ pointerEvents: "none" }}>
          <div
            className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
              hovered || isSelected
                ? "bg-[#00E5FF]/20 shadow-[0_0_20px_rgba(0,229,255,0.8)] scale-110"
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

      {/* Expanded Interactive Tooltip on Hover / Select */}
      {(hovered || isSelected) && (
        <Billboard position={[0, 0.55, 0.15]}>
          <Html transform distanceFactor={4.5} style={{ pointerEvents: "none" }}>
            <div className="bg-[#030914]/95 backdrop-blur-xl border border-[#00E5FF] rounded-2xl p-3.5 shadow-[0_0_35px_rgba(0,229,255,0.45)] text-left min-w-[210px] pointer-events-auto">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[9px] font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
                  {data.category}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{data.name}</h4>
              <p className="text-[10px] text-[#94A3B8] leading-tight mb-2">
                {data.subtitle}
              </p>
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-[#00FFFF]">
                <span>TELEMETRY:</span>
                <span className="font-bold">{data.stats}</span>
              </div>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

// =========================================================================
// 5. CYBER PERSPECTIVE FLOOR & 3D HUD CHARTS (Matching Vector Art)
// =========================================================================
function CyberPerspectiveFloor() {
  const radarOuterRef = useRef<THREE.Mesh>(null);
  const radarInnerRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (radarOuterRef.current) {
      radarOuterRef.current.rotation.z += delta * 0.25;
    }
    if (radarInnerRef.current) {
      radarInnerRef.current.rotation.z -= delta * 0.4;
    }
  });

  return (
    <group position={[0, -1.45, 0]}>
      {/* 3D Perspective Ground Grid */}
      <gridHelper
        args={[14, 28, "#00E5FF", "#0A2540"]}
        position={[0, -0.01, 0]}
      />

      {/* CONCENTRIC RADAR RINGS (Floor Scanner) */}
      <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Outer Rotating Degree Ring */}
        <mesh ref={radarOuterRef}>
          <ringGeometry args={[2.2, 2.26, 64]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Counter-rotating Inner Ring */}
        <mesh ref={radarInnerRef}>
          <ringGeometry args={[1.6, 1.64, 48]} />
          <meshBasicMaterial
            color="#12CDB5"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Core Center Reticle */}
        <mesh>
          <ringGeometry args={[0.9, 0.94, 32]} />
          <meshBasicMaterial
            color="#00FFFF"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 3D HOLOGRAPHIC DATA CONES (Coordinates 5.232145 & 8.235687 from Vector) */}
      <group position={[1.4, 0.25, 1.2]}>
        <mesh>
          <coneGeometry args={[0.22, 0.55, 16]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00B4D8"
            emissiveIntensity={1.2}
            transparent
            opacity={0.65}
          />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.ConeGeometry(0.22, 0.55, 8)]} />
          <lineBasicMaterial color="#FFFFFF" />
        </lineSegments>
        <Billboard position={[0, 0.42, 0]}>
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
            emissiveIntensity={1.0}
            transparent
            opacity={0.6}
          />
        </mesh>
        <Billboard position={[0, 0.3, 0]}>
          <Text fontSize={0.07} color="#94A3B8" anchorX="center">
            8.235687
          </Text>
        </Billboard>
      </group>

      {/* 3D HOLOGRAPHIC CYLINDRICAL PIE CHART (Matching Vector 35%, 20%, 75%) */}
      <group position={[-0.9, 0.08, 1.1]}>
        {/* Slice A: 35% Cyan */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry
            args={[0.34, 0.34, 0.08, 24, 1, false, 0, Math.PI * 0.7]}
          />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00B4D8"
            emissiveIntensity={1.2}
          />
        </mesh>
        {/* Slice B: 20% Teal */}
        <mesh
          position={[0.04, 0.03, 0.04]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[0.34, 0.34, 0.12, 24, 1, false, Math.PI * 0.75, Math.PI * 0.4]}
          />
          <meshStandardMaterial
            color="#14F195"
            emissive="#10B981"
            emissiveIntensity={1.4}
          />
        </mesh>
        <Billboard position={[0, 0.28, 0]}>
          <Text fontSize={0.07} color="#00FFFF" anchorX="center">
            35% • SYNC
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

// =========================================================================
// 6. AMBIENT CYBER DUST & PARTICLES
// =========================================================================
function AmbientCyberParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const particleData = useMemo(() => {
    const count = 240;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.008;
    }
  });

  return (
    <points ref={pointsRef} geometry={particleData}>
      <pointsMaterial
        size={0.035}
        color="#00E5FF"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// =========================================================================
// 7. CAMERA PRESET CONTROLLER (Smooth Animated Transitions)
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
          pos: new THREE.Vector3(-1.9, 0.4, 2.5),
          look: new THREE.Vector3(-1.9, 0.5, 0),
        };
      case "doctor":
        return {
          pos: new THREE.Vector3(2.1, 0.4, 2.6),
          look: new THREE.Vector3(2.1, 0.6, 0),
        };
      case "telemetry":
        return {
          pos: new THREE.Vector3(0, 0.8, 3.2),
          look: new THREE.Vector3(0, 0.7, 0),
        };
      case "overview":
      default:
        return {
          pos: new THREE.Vector3(0, 0.3, 4.6),
          look: new THREE.Vector3(0, 0.1, 0),
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
      minDistance={2.5}
      maxDistance={7.0}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 1.9}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      dampingFactor={0.06}
    />
  );
}

// =========================================================================
// 8. ROOT EXPORT: HOLOGRAPHIC VECTOR HERO 3D STAGE
// =========================================================================
export const HolographicVectorHero3D: React.FC = () => {
  const [selectedHex, setSelectedHex] = useState<string>("cardio");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("overview");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showBackdrop, setShowBackdrop] = useState<boolean>(true);
  const [patientHover, setPatientHover] = useState<boolean>(false);
  const [doctorHover, setDoctorHover] = useState<boolean>(false);

  return (
    <div className="relative w-full h-[580px] sm:h-[640px] lg:h-[700px] rounded-3xl bg-[#030914] overflow-hidden border border-[#00E5FF]/20 shadow-[0_20px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(0,229,255,0.15)] select-none">
      {/* AUTHENTIC VECTOR BACKDROP LAYER (Blended with 3D Canvas) */}
      {showBackdrop && (
        <div
          className="absolute inset-0 bg-center bg-cover pointer-events-none opacity-25 mix-blend-screen transition-opacity duration-700"
          style={{
            backgroundImage: "url('/images/hero-vector.png')",
            filter: "contrast(1.2) brightness(0.9)",
          }}
        />
      )}

      {/* Volumetric Radial Lighting Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#030914_90%)] pointer-events-none z-10" />

      {/* ========================================================= */}
      {/* TOP SCI-FI HUD HEADER BAR                                 */}
      {/* ========================================================= */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between bg-gradient-to-b from-[#030914]/90 to-transparent border-b border-white/5 backdrop-blur-sm">
        {/* Left Status Pill */}
        <div className="flex items-center gap-2.5 font-mono text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]" />
          </span>
          <span className="text-white font-bold tracking-wide">
            HOLOGRAPHIC MEDICAL ECOSYSTEM
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 text-[10px]">
            SYSTEM LINK: ONLINE (99.8%)
          </span>
        </div>

        {/* Right HUD Indicators */}
        <div className="flex items-center gap-2">
          {/* Backdrop Toggle */}
          <button
            onClick={() => setShowBackdrop(!showBackdrop)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all duration-200 border flex items-center gap-1.5 ${
              showBackdrop
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                : "bg-white/5 text-white/50 border-white/10 hover:text-white"
            }`}
            title="Toggle authentic vector art backdrop blend"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Vector Layer</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all duration-200 border flex items-center gap-1.5 ${
              autoRotate
                ? "bg-[#12CDB5]/20 text-[#12CDB5] border-[#12CDB5]/40"
                : "bg-white/5 text-white/50 border-white/10 hover:text-white"
            }`}
            title="Toggle subtle 3D camera rotation"
          >
            <RotateCcw className={`w-3 h-3 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
            <span className="hidden sm:inline">Orbit</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3D WEBGL CANVAS STAGE                                      */}
      {/* ========================================================= */}
      <Canvas
        camera={{ position: [0, 0.3, 4.6], fov: 48 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Atmosphere & Lighting */}
        <color attach="background" args={["#030914"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 6, 4]} intensity={1.2} color="#FFFFFF" />
        <directionalLight position={[-5, 4, -2]} intensity={0.8} color="#00E5FF" />
        <pointLight position={[0, 2, 2]} intensity={1.5} color="#00E5FF" />

        {/* 1. Left: Holographic Patient (Human Digital Twin) */}
        <HolographicPatient
          isHovered={patientHover}
          onHover={setPatientHover}
        />

        {/* 2. Right: Holographic Doctor (Physician with Stethoscope & Folded Arms) */}
        <HolographicDoctor
          isHovered={doctorHover}
          onHover={setDoctorHover}
        />

        {/* 3. Sweeping Orbital Telemetry Arc linking Patient & Doctor */}
        <OrbitalTelemetryArc speed={1.2} />

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

        {/* 6. Ambient Cyber Dust Particles */}
        <AmbientCyberParticles />

        {/* 7. Camera & Orbit Controller */}
        <CameraController preset={cameraPreset} autoRotate={autoRotate} />
      </Canvas>

      {/* ========================================================= */}
      {/* BOTTOM SCI-FI CONTROLS & CAMERA PRESETS                   */}
      {/* ========================================================= */}
      <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#030914]/85 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 px-3.5 shadow-2xl">
        {/* Camera Preset Switches */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[10px] font-mono text-white/50 mr-1 hidden sm:inline">
            CAMERA:
          </span>
          {[
            { id: "overview", label: "Full Ecosystem", icon: Maximize2 },
            { id: "patient", label: "Patient Twin", icon: Activity },
            { id: "doctor", label: "Doctor AI", icon: Stethoscope },
            { id: "telemetry", label: "Telemetry Stream", icon: Zap },
          ].map((btn) => {
            const Icon = btn.icon;
            const active = cameraPreset === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setCameraPreset(btn.id as CameraPreset)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-[#00E5FF] to-[#12CDB5] text-[#040810] font-bold shadow-[0_0_18px_rgba(0,229,255,0.4)]"
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interaction Hint */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-white/40">
          <Sparkles className="w-3 h-3 text-[#00E5FF]" />
          <span>Drag to rotate • Scroll to zoom • Click hexagons for diagnostics</span>
        </div>
      </div>
    </div>
  );
};

export default HolographicVectorHero3D;
