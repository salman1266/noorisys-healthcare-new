"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamic client-side import for 3D Holographic Medical Science Scene (Vector Art in 3D)
const HolographicVectorHero3D = dynamic(
  () => import("@/components/3d/HolographicVectorHero3D"),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[580px] sm:h-[640px] lg:h-[700px] flex items-center justify-center rounded-3xl bg-[#030914] border border-[#00E5FF]/20 overflow-hidden shadow-2xl">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="relative flex flex-col items-center gap-5 z-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-[#12CDB5]/20 border-b-[#12CDB5] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <div className="absolute inset-4 rounded-full bg-[#00E5FF]/20 animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold text-[#00E5FF] tracking-widest uppercase block">
              Initializing Holographic 3D Link...
            </span>
            <span className="text-[11px] text-[#94A3B8] font-mono block">
              Synthesizing Patient Avatar, Physician AI & Telemetry Arc
            </span>
          </div>
        </div>
      </div>
    ),
  }
);

export const Hero3DWrapper: React.FC = () => {
  return <HolographicVectorHero3D />;
};

export default Hero3DWrapper;
