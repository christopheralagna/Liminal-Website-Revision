"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Coffee, Utensils, Heart, ArrowRight, Sparkles, Check, Info } from "lucide-react";
import { MENU_ITEMS, EQUITY_MODEL_EXPLANATION, MenuItem } from "@/data/menu";

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "beverages" | "small-plates" | "vegan" | "gluten-free">("all");
  const [sliderLevel, setSliderLevel] = useState<number>(2); // 0: Pay Low ($0), 1: Reduced ($2), 2: Base ($4), 3: Pay High ($8), 4: Solidarity Champion ($12)

  const filteredItems = MENU_ITEMS.filter((item) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "beverages") return item.category === "beverages";
    if (selectedCategory === "small-plates") return item.category === "small-plates";
    if (selectedCategory === "vegan") return item.dietary?.includes("Vegan");
    if (selectedCategory === "gluten-free") return item.dietary?.includes("Gluten-Free");
    return true;
  });

  const equityTiers = [
    {
      level: 0,
      label: "Pay Nothing / Low ($0 – $1)",
      description: "100% subsidized by community surplus. No questions asked, no proof of need required.",
      pill: "Mutual Aid",
      badgeClass: "bg-sage-300/20 text-sage-300 border-sage-300/30",
    },
    {
      level: 1,
      label: "Pay Reduced ($2.00)",
      description: "Subsidized cup covering only the basic bulk wholesale ingredients.",
      pill: "Low Barrier",
      badgeClass: "bg-peach-300/20 text-peach-200 border-peach-300/30",
    },
    {
      level: 2,
      label: "Base Suggested Cost ($3 – $4)",
      description: "Covers organic ingredients, fair-trade coffee beans, oat milk, and utilities.",
      pill: "Standard Base",
      badgeClass: "bg-terracotta-400/20 text-terracotta-300 border-terracotta-400/30",
    },
    {
      level: 3,
      label: "Pay High ($6 – $8)",
      description: "Generates extra revenue that immediately covers a meal or coffee for someone else.",
      pill: "Equity Supporter",
      badgeClass: "bg-terracotta-500 text-cream-50 border-terracotta-400",
    },
    {
      level: 4,
      label: "Community Solidarity ($12+)",
      description: "Subsidizes multiple drinks, meals, and directly contributes toward monthly building rent.",
      pill: "Solidarity Champion",
      badgeClass: "bg-terracotta-600 text-cream-50 border-terracotta-300",
    },
  ];

  const currentTier = equityTiers[sliderLevel];

  return (
    <div className="w-full bg-charcoal-950 text-cream-100">
      {/* Header Banner */}
      <section className="w-full pt-10 sm:pt-14 pb-8 border-b border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
            Historical Menu &bull; 2021
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-cream-50">
            Café Menu &amp; Equity Model
          </h1>
          <p className="text-lg sm:text-xl text-peach-300 font-light max-w-2xl mx-auto leading-relaxed">
            Craft coffee, single-origin pour-overs, artisan herbal teas, and nutritious small plates
            served on a community sliding-scale.
          </p>
        </div>
      </section>

      {/* The Interactive Equity Model Simulator */}
      <section className="w-full py-12 sm:py-16 bg-charcoal-900 border-b border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-charcoal-950 border border-charcoal-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
              <div>
                <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400">
                  Interactive Historical Demonstration
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-cream-50 mt-1">
                  {EQUITY_MODEL_EXPLANATION.title}
                </h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentTier.badgeClass}`}>
                {currentTier.pill}
              </span>
            </div>

            <p className="text-sm sm:text-base text-cream-300 font-light leading-relaxed">
              {EQUITY_MODEL_EXPLANATION.text}
            </p>

            {/* Interactive Slider */}
            <div className="space-y-4 pt-2">
              <label htmlFor="equity-slider" className="block text-xs uppercase tracking-wider text-cream-400 font-mono">
                Drag to explore sliding-scale contribution tiers:
              </label>
              <input
                id="equity-slider"
                type="range"
                min="0"
                max="4"
                step="1"
                value={sliderLevel}
                onChange={(e) => setSliderLevel(parseInt(e.target.value))}
                className="w-full h-3 bg-charcoal-800 rounded-lg appearance-none cursor-pointer accent-terracotta-500 focus:outline-none focus:ring-2 focus:ring-peach-300"
              />
              <div className="flex justify-between text-[11px] sm:text-xs text-cream-400 font-mono">
                <span>$0 (Pay Nothing)</span>
                <span>$2 (Reduced)</span>
                <span>$4 (Base)</span>
                <span>$8 (Pay High)</span>
                <span>$12+ (Solidarity)</span>
              </div>
            </div>

            {/* Active Tier Outcome Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-terracotta-500/20 text-peach-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-cream-50">
                  {currentTier.label}
                </h3>
                <p className="text-sm text-cream-300 font-light mt-1">
                  {currentTier.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories Filter & Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-10">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { key: "all", label: "Full Menu" },
            { key: "beverages", label: "Beverages" },
            { key: "small-plates", label: "Small Plates" },
            { key: "vegan", label: "Vegan Options" },
            { key: "gluten-free", label: "Gluten-Free" },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key as any)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat.key
                  ? "bg-terracotta-500 text-cream-50 shadow-md shadow-terracotta-600/30"
                  : "bg-charcoal-900 text-cream-300 hover:text-cream-50 border border-charcoal-800 hover:bg-charcoal-850"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-charcoal-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-cream-50 font-sans">
                      {item.name}
                    </h3>
                    {item.partner && (
                      <span className="text-[11px] font-mono text-terracotta-300 block mt-0.5">
                        Partner: {item.partner}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-lg font-semibold text-peach-300 flex-shrink-0">
                    {item.price}
                  </span>
                </div>

                <p className="text-sm text-cream-300 font-light leading-relaxed mt-2.5">
                  {item.description}
                </p>
              </div>

              {/* Dietary Tags */}
              {item.dietary && item.dietary.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-charcoal-800">
                  {item.dietary.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-charcoal-950 text-sage-300 border border-sage-300/20 text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Partner Spotlight: Evolve Eats */}
      <section className="w-full bg-charcoal-900 py-16 px-4 border-t border-charcoal-800">
        <div className="max-w-4xl mx-auto space-y-4 bg-charcoal-950 border border-charcoal-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-peach-300" />
            <h3 className="text-xl font-semibold text-cream-50">
              Community Food Partnership: Evolve Eats
            </h3>
          </div>
          <p className="text-sm sm:text-base text-cream-300 font-light leading-relaxed">
            Because Liminal operated without commercial cooking ovens or grease traps to maintain
            low infrastructure overhead, all small plates and sandwiches were prepared and delivered fresh
            daily by <strong>Evolve Eats</strong>, a local Flagstaff health-conscious food initiative.
            This mutual-aid partnership kept kitchen costs accessible while offering nutritious vegan and
            gluten-free nourishment to the community.
          </p>
        </div>
      </section>

      {/* Navigation Footer Banner */}
      <section className="w-full bg-terracotta-500 text-cream-50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-2xl font-semibold">Discover Historical Events &amp; Workshops</h3>
            <p className="text-cream-100 text-sm mt-1">
              Browse past Narcan trainings, live jazz nights, movie screenings, and benefit dance parties.
            </p>
          </div>
          <Link
            href="/programming"
            className="px-6 py-3 rounded-full bg-charcoal-950 text-cream-50 hover:bg-charcoal-900 font-medium text-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <span>Events Archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
