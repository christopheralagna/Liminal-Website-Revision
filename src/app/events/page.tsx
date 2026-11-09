"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Calendar, Clock, Eye, X, Users } from "lucide-react";
import { PageHero } from "@/components/public/PageHero";
import { HISTORICAL_EVENTS, HistoricalEvent } from "@/data/events";
import { ArchiveDialog } from "@/components/public/ArchiveDialog";

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeFlyerEvent, setActiveFlyerEvent] = useState<HistoricalEvent | null>(null);

  const categories = [
    { key: "all", label: "All Events" },
    { key: "mutual-aid", label: "Mutual Aid & Harm Reduction" },
    { key: "music", label: "Live Music & Culture" },
    { key: "education", label: "Political Education & Film" },
    { key: "arts", label: "Community Arts & Gallery" },
    { key: "community", label: "Community Gatherings" },
  ];

  const filteredEvents = HISTORICAL_EVENTS.filter((event) => {
    if (selectedCategory === "all") return true;
    return event.category === selectedCategory;
  });

  return (
    <div className="w-full bg-charcoal-950 text-cream-100">
      {/* 1. Page Hero */}
      <PageHero
        eyebrow="Historical Programming • 2021–2023"
        title="Community Events Archive"
        subtitle="A selection of event listings, flyers, and descriptions from Liminal’s records."
      />

      {/* 2. Historical Notice Banner */}
      <section className="w-full bg-charcoal-900 border-b border-charcoal-800 py-3.5 px-4 text-center">
        <p className="text-xs sm:text-sm text-cream-300">
          <span className="font-semibold text-terracotta-400">Historical Archive:</span> Events
          and activities below were advertised or described in Liminal’s records. Some descriptions
          outlined plans; they do not confirm that every event took place. Liminal closed in 2023.
        </p>
      </section>

      {/* 3. Category Filter Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              aria-pressed={selectedCategory === cat.key}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat.key
                  ? "bg-terracotta-500 text-cream-50 shadow-md shadow-terracotta-600/30"
                  : "bg-charcoal-900 text-cream-300 hover:text-cream-50 border border-charcoal-800 hover:bg-charcoal-850"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Events Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-charcoal-700 transition-all duration-200 group"
            >
              <div>
                {/* Archival Flyer Thumbnail */}
                {event.flyerSrc ? (
                  <button
                    type="button"
                    aria-label={`View flyer for ${event.title}`}
                    className="relative block aspect-[16/10] w-full overflow-hidden bg-charcoal-950 cursor-pointer"
                    onClick={() => setActiveFlyerEvent(event)}
                  >
                    <Image
                      src={event.flyerSrc}
                      alt={`Archival flyer for ${event.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-charcoal-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs text-cream-50 font-medium backdrop-blur-[2px]">
                      <Eye className="w-4 h-4 text-peach-300" />
                      <span>View Archival Flyer</span>
                    </div>
                  </button>
                ) : (
                  <div className="aspect-[16/6] w-full bg-charcoal-950/80 border-b border-charcoal-800 flex items-center px-6">
                    <span className="text-xs font-mono uppercase tracking-wider text-terracotta-400">
                      {event.categoryLabel}
                    </span>
                  </div>
                )}

                {/* Event Content Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    {event.dateStr && <div className="flex items-center gap-2 text-xs font-mono text-terracotta-300">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{event.dateStr}</span>
                    </div>}
                    {event.timeStr && (
                      <div className="flex items-center gap-2 text-xs font-mono text-cream-400">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{event.timeStr}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-cream-50 group-hover:text-peach-200 transition-colors leading-snug">
                    {event.title}
                  </h3>

                  <p className="text-sm text-cream-300 font-light leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Event Card Footer */}
              <div className="px-6 pb-6 pt-3 border-t border-charcoal-800/60 flex items-center justify-between text-xs text-cream-400 font-mono">
                {event.organizer ? (
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <Users className="w-3.5 h-3.5 text-peach-300 flex-shrink-0" />
                    <span className="truncate">{event.organizer}</span>
                  </div>
                ) : (
                  <span>Archival event record</span>
                )}

                {event.flyerSrc && (
                  <button
                    type="button"
                    onClick={() => setActiveFlyerEvent(event)}
                    className="text-peach-300 hover:text-cream-50 transition-colors underline decoration-peach-300/40"
                  >
                    Flyer
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Archival Flyer Lightbox Modal */}
      {activeFlyerEvent && (
        <ArchiveDialog
          title={`Archival Flyer: ${activeFlyerEvent.title}`}
          onClose={() => setActiveFlyerEvent(null)}
        >
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-cream-50">
                  {activeFlyerEvent.title}
                </h3>
                <p className="text-xs font-mono text-terracotta-300 mt-0.5">
                  {[activeFlyerEvent.dateStr, activeFlyerEvent.categoryLabel].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveFlyerEvent(null)}
                aria-label="Close dialog"
                className="text-cream-400 hover:text-cream-100 p-1.5 rounded-lg hover:bg-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flyer Image */}
            {activeFlyerEvent.flyerSrc && (
              <div className="relative aspect-[4/5] max-h-[60vh] w-full rounded-xl overflow-hidden bg-charcoal-950 border border-charcoal-800">
                <Image
                  src={activeFlyerEvent.flyerSrc}
                  alt={`Archival flyer for ${activeFlyerEvent.title}`}
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            )}

            <p className="text-xs sm:text-sm text-cream-200 font-light leading-relaxed">
              {activeFlyerEvent.description}
            </p>
          </div>
        </ArchiveDialog>
      )}
    </div>
  );
}

