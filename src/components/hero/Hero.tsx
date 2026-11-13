"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Activity, ShieldCheck, Stethoscope, Cpu } from "lucide-react";
import { Hero3DWrapper } from "@/components/3d/Hero3DWrapper";

export const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-[94vh] pt-32 pb-20 flex items-center overflow-hidden bg-transparent">
      {/* Background Volumetric Sci-Fi Cyan Lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-[radial-gradient(circle,rgba(0,229,255,0.12)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute top-1/3 right-10 w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(18,205,181,0.09)_0%,transparent_70%)] pointer-events-none blur-3xl" />

      {/* Cybernetic Coordinate Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Headline, Description & Direct CTAs           */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-center text-left"
          >
            {/* Holographic Category Label */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#061426] border border-[#00E5FF]/30 text-xs font-mono font-medium text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                NOORISYS HEALTHCARE • 3D HOLOGRAPHIC SYSTEM
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
            >
              Healthcare,{" "}
              <span className="bg-gradient-to-r from-[#00E5FF] via-[#12CDB5] to-[#FFFFFF] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,229,255,0.35)]">
                Connected by Intelligence.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-xl mb-6"
            >
              A unified digital healthcare ecosystem linking patient digital twins, physician intelligence, diagnostics, and smart therapeutics through real-time telemetry.
            </motion.p>

            {/* Live Telemetry Feature Tags */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex flex-wrap items-center gap-2.5 mb-8 text-xs font-mono"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#07192F]/80 border border-[#00E5FF]/20 text-[#00E5FF]">
                <Activity className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Patient Digital Twin</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#07192F]/80 border border-[#12CDB5]/20 text-[#12CDB5]">
                <Stethoscope className="w-3.5 h-3.5 text-[#12CDB5]" />
                <span>Physician AI Nexus</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#07192F]/80 border border-white/10 text-white/70">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Real-Time Telemetry</span>
              </div>
            </motion.div>

            {/* Buttons: Explore Products & Interactive 3D */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="flex flex-wrap items-center gap-4 mb-10"
            >
              <Link
                href="/#products"
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#12CDB5] text-[#040810] text-sm font-bold shadow-[0_0_30px_rgba(0,229,255,0.35)] hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] hover:scale-[1.02] transition-all duration-200"
              >
                <span>Explore 15 Products</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/#about"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#07192F]/90 hover:bg-[#07192F] text-white hover:text-[#00E5FF] text-sm font-semibold border border-white/10 hover:border-[#00E5FF]/40 transition-all duration-200"
              >
                <span>About Noorisys</span>
              </Link>
            </motion.div>

            {/* Verified Portfolio Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4"
            >
              <div className="flex flex-col">
                <div className="font-heading text-2xl lg:text-3xl font-extrabold text-white">
                  15
                </div>
                <div className="text-xs text-[#94A3B8] mt-0.5">Healthcare Products</div>
              </div>

              <div className="flex flex-col">
                <div className="font-heading text-2xl lg:text-3xl font-extrabold text-white">
                  3
                </div>
                <div className="text-xs text-[#94A3B8] mt-0.5">Core Practice Areas</div>
              </div>

              <div className="flex flex-col">
                <div className="font-heading text-2xl lg:text-3xl font-extrabold text-white">
                  99.9%
                </div>
                <div className="text-xs text-[#94A3B8] mt-0.5">Clinical Reliability</div>
              </div>
            </motion.div>
          </motion.div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: 3D Holographic Scene (Vector Art in 3D)      */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative"
          >
            {/* Architectural Frame with CAD Corner Crosshairs & Glowing Border */}
            <div className="cad-corner relative rounded-3xl p-1 bg-gradient-to-b from-[#00E5FF]/30 via-white/5 to-[#00E5FF]/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(0,229,255,0.18)]">
              <Hero3DWrapper />
            </div>

            {/* Minimalist Subtitle Pill */}
            <div className="absolute -bottom-4 left-6 hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#061426]/95 border border-[#00E5FF]/30 shadow-glass backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span className="text-xs text-[#94A3B8]">
                Interactive 3D Hologram • Drag to Orbit • Click Hexagons
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
