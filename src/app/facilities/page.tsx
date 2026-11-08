import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { FACILITIES } from "@/data/facilities";

export const metadata: Metadata = {
  title: "Facilities & Rooms — Liminal Community Center & Cafe Historical Archive",
  description:
    "Explore the physical spaces of Liminal: the pay-what-you-can cafe bar, free art supply room, radical library, multimedia hall, and harm reduction station.",
};

export default function FacilitiesPage() {
  return (
    <div className="w-full bg-charcoal-950 text-cream-100">
      {/* Header Banner */}
      <section className="w-full pt-10 sm:pt-14 pb-8 border-b border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
            Physical Architecture • 217 S San Francisco St
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-cream-50">
            Our Facilities &amp; Spaces
          </h1>
          <p className="text-lg sm:text-xl text-peach-300 font-light max-w-2xl mx-auto leading-relaxed">
            Our center consisted of a donation-only cafe, a radical library, an open art supply room,
            and a multimedia assembly space.
          </p>
        </div>
      </section>

      {/* Facilities Breakdown - Alternating Section Blocks */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        {FACILITIES.map((facility, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={facility.id}
              id={facility.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
                isEven ? "" : "lg:flex-row-reverse"
              }`}
            >
              {/* Photo Column */}
              <div className={`lg:col-span-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-charcoal-800 bg-charcoal-900 group">
                  <Image
                    src={facility.imageSrc}
                    alt={facility.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 550px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 text-xs font-mono text-cream-200 bg-charcoal-950/80 backdrop-blur-sm px-3 py-1.5 rounded border border-charcoal-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terracotta-400" />
                    <span>{facility.name}</span>
                  </div>
                </div>
              </div>

              {/* Text & Features Column */}
              <div className={`lg:col-span-6 space-y-5 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400">
                  Room {index + 1} of {FACILITIES.length}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-cream-50 leading-tight">
                  {facility.name}
                </h2>
                <p className="text-sm sm:text-base font-serif italic text-peach-300">
                  {facility.subtitle}
                </p>
                <p className="text-base sm:text-lg text-cream-200/90 font-light leading-relaxed">
                  {facility.description}
                </p>

                {/* Bulleted Feature Badges */}
                <ul className="space-y-2.5 pt-2">
                  {facility.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2.5 text-sm text-cream-300">
                      <CheckCircle2 className="w-4 h-4 text-terracotta-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      {/* Municipal Permit & Architecture Note */}
      <section className="w-full bg-charcoal-900 border-t border-charcoal-800 py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-4 text-center sm:text-left bg-charcoal-950 border border-charcoal-800 rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-cream-50">
            Historic Building Context: 217 S San Francisco St
          </h3>
          <p className="text-sm sm:text-base text-cream-300 font-light leading-relaxed">
            Originally constructed as a historic two-story sandstone masonry building in Flagstaff&apos;s
            Southside district, the space was classified as an Assembly space (ASSEMBLY A-2).
            To avoid commercial exhaust and grease trap mandates while maintaining community health standards,
            Liminal intentionally operated as a cold-kitchen beverage bar with pre-packaged nutritious meals
            delivered fresh by local cooperative <em>Evolve Eats</em>, alongside installed wave-style bicycle
            parking on San Francisco Street.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-terracotta-300">
            <span>• Southside Historic District</span>
            <span>• Historic Sandstone Masonry</span>
            <span>• 100% Volunteer Operated</span>
          </div>
        </div>
      </section>

      {/* Navigation Footer Banner */}
      <section className="w-full bg-terracotta-500 text-cream-50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-2xl font-semibold">View the Historical Cafe Menu</h3>
            <p className="text-cream-100 text-sm mt-1">
              Explore the coffee, teas, vegan small plates, and the &ldquo;Pay High // Pay Low&rdquo; pricing model.
            </p>
          </div>
          <Link
            href="/menu"
            className="px-6 py-3 rounded-full bg-charcoal-950 text-cream-50 hover:bg-charcoal-900 font-medium text-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <span>See the Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
