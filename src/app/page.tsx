import React from "react";
import { Hero } from "@/components/hero/Hero";
import { AboutNoorisys } from "@/components/sections/AboutNoorisys";
import { ProductShowcase } from "@/components/products/ProductShowcase";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { WhyNoorisys } from "@/components/sections/WhyNoorisys";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* SECTION 2 — HERO (Concept A + C 3D Architectural Scene) */}
      <Hero />

      {/* SECTION 3 — ABOUT NOORISYS HEALTHCARE */}
      <AboutNoorisys />

      {/* SECTION 4 — A PORTFOLIO OF HEALTHCARE INNOVATIONS (All 15 Products in 3-Card Grid) */}
      <ProductShowcase />

      {/* SECTION 5 — WHAT WE DO (Healthcare Software, Digital Solutions, Tech Development) */}
      <WhatWeDo />

      {/* SECTION 6 — WHY NOORISYS (5 Core Development Principles) */}
      <WhyNoorisys />

      {/* SECTION 7 — CONTACT & PARTNERSHIP (Form & Verified Business Details) */}
      <ContactSection />
    </div>
  );
}
