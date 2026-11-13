"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductShowcaseProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  title,
  subtitle,
  showFilters = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Close modal on ESC key and freeze scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalProduct(null);
    };
    if (modalProduct) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalProduct]);

  // Filter products by category & search term
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.categories.includes(selectedCategory as any) ||
        product.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.shortDescription.toLowerCase().includes(q) ||
        product.tagline.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.keyFeatures.some((f) => f.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="products" className="relative py-28 bg-[#040810]/75 backdrop-blur-xs overflow-hidden">
      {/* Background Radiance */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(18,205,181,0.05)_0%,transparent_70%)] pointer-events-none blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Section Header with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-white/[0.08]"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1C2E] border border-white/10 text-xs font-mono text-[#00E5FF] mb-3">
              <Sparkles className="h-3 w-3 text-[#00E5FF]" />
              PORTFOLIO DIRECTORY
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {title || "A Portfolio of Healthcare Innovations"}
            </h2>
          </div>

          <p className="text-sm text-[#94A3B8] max-w-md leading-relaxed">
            {subtitle ||
              "Explore our portfolio of healthcare technology products designed for different needs across the healthcare ecosystem."}
          </p>
        </motion.div>

        {/* Filter Tabs & Search Bar with Reveal */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-10 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Search Input */}
              <div className="w-full sm:max-w-md relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by capability, domain, or name..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#07111F] border border-white/10 text-white placeholder-[#64748B] text-xs sm:text-sm focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Product Counter */}
              <div className="text-xs font-mono text-[#94A3B8] self-end sm:self-center">
                Displaying <strong className="text-white">{filteredProducts.length}</strong> of{" "}
                <strong className="text-white">{PRODUCTS.length}</strong> verified innovations
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-[#00E5FF] text-[#040810] font-bold shadow-[0_0_15px_rgba(0,229,255,0.35)]"
                        : "bg-[#0D1C2E]/60 text-[#94A3B8] hover:text-white hover:bg-[#0D1C2E] border border-white/5"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 3 CARDS IN ONE ROW (Grid: 1 col mobile, 2 col tablet, 3 col desktop) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
            {filteredProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                index={idx}
                onQuickView={(prod) => setModalProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-[#07111F] border border-white/10 max-w-lg mx-auto">
            <SlidersHorizontal className="h-8 w-8 text-[#64748B] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">No products found</h4>
            <p className="text-xs text-[#94A3B8] mb-4">Try clearing your search query or domain filters.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#00E5FF] text-[#040810] text-xs font-bold hover:bg-[#12CDB5] transition-colors"
            >
              Reset Directory
            </button>
          </div>
        )}

      </div>

      {/* QUICK VIEW PRODUCT MODAL */}
      <AnimatePresence>
        {modalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="cad-corner relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#07111F] border border-[#00E5FF]/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(0,229,255,0.2)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalProduct(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Top Metadata */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-mono font-bold text-[#D4A373] px-2.5 py-1 rounded bg-[#D4A373]/10 border border-[#D4A373]/20">
                  {modalProduct.badge || "Verified Healthcare System"}
                </span>
                <span className="text-xs font-mono text-[#00E5FF]">
                  {modalProduct.status}
                </span>
              </div>

              {/* Logo Banner */}
              {modalProduct.logoUrl && (
                <div className="mb-5 h-14 flex items-center justify-start">
                  <img
                    src={modalProduct.logoUrl}
                    alt={`${modalProduct.name} Logo`}
                    className="h-12 sm:h-14 w-auto max-w-[280px] object-contain object-left"
                  />
                </div>
              )}

              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {modalProduct.name}
              </h3>
              
              <p className="text-xs sm:text-sm font-semibold text-[#12CDB5] mb-4">
                {modalProduct.tagline}
              </p>

              <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                {modalProduct.fullDescription}
              </p>

              {/* Key Features */}
              <div className="space-y-2 mb-6">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#00E5FF] block">
                  Core Capabilities:
                </span>
                {modalProduct.keyFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#F5F8FC]">
                    <CheckCircle2 className="h-4 w-4 text-[#00E5FF] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Stakeholders */}
              <div className="pt-4 border-t border-white/10 mb-8">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block mb-1.5">
                  Target Stakeholders:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {modalProduct.stakeholders.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-0.5 rounded-lg bg-white/5 text-[#94A3B8] border border-white/5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                <Link
                  href={`/products/${modalProduct.slug}`}
                  onClick={() => setModalProduct(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#00E5FF] text-[#040810] text-xs font-bold hover:bg-[#12CDB5] transition-all"
                >
                  <span>Open Full Specifications Page</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {modalProduct.verifiedUrl && (
                  <a
                    href={modalProduct.verifiedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
                  >
                    <span>Launch Official Platform</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#10B981]" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
