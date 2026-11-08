"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Sparkles, ArrowRight, Eye, ShieldAlert, X } from "lucide-react";
import { HISTORICAL_EVENTS, HistoricalEvent } from "@/data/events";
import { ArchiveDialog } from "@/components/public/ArchiveDialog";

export default function ProgrammingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFlyer, setSelectedFlyer] = useState<HistoricalEvent | null>(null);

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
      {/* Header Banner */}
      <section className="w-full pt-10 sm:pt-14 pb-8 border-b border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
            Historical Archive • 2021–2023
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-cream-50">
            Events &amp; Programming Archive
          </h1>
          <p className="text-lg sm:text-xl text-peach-300 font-light max-w-2xl mx-auto leading-relaxed">
            Free and donation-only workshops, mutual aid kit-building, working-class film nights,
            open jazz sessions, and community assemblies.
          </p>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
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
      </section>

      {/* Events Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-charcoal-700 transition-all duration-200 group"
            >
              {/* Flyer Thumbnail if available */}
              {event.flyerSrc ? (
                <div
                  className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-950 cursor-pointer"
                  onClick={() => setSelectedFlyer(event)}
                >
                  <Image
                    src={event.flyerSrc}
                    alt={`Promotional flyer for ${event.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-charcoal-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-cream-50 font-medium backdrop-blur-[2px]">
                    <Eye className="w-4 h-4" />
                    <span>View Archival Flyer</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/6] w-full bg-charcoal-950/80 border-b border-charcoal-800 flex items-center px-6">
                  <span className="text-xs font-mono uppercase tracking-wider text-terracotta-400">
                    {event.categoryLabel}
                  </span>
                </div>
              )}

              {/* Event Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-terracotta-300 uppercase tracking-wider block">
                      {event.categoryLabel}
                    </span>
                    <h3 className="text-xl font-semibold text-cream-50 group-hover:text-peach-200 transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <div className="space-y-1 text-xs text-cream-300 font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-peach-300 flex-shrink-0" />
                      <span>{event.dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-peach-300 flex-shrink-0" />
                      <span>{event.timeStr}</span>
                    </div>
                    {event.organizer && (
                      <div className="pt-1 text-[11px] text-cream-400">
                        Host: {event.organizer}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-cream-200/90 font-light leading-relaxed pt-1">
                    {event.description}
                  </p>
                </div>

                {event.flyerSrc && (
                  <div className="pt-3 border-t border-charcoal-800">
                    <button
                      type="button"
                      onClick={() => setSelectedFlyer(event)}
                      className="text-xs font-medium text-peach-300 hover:text-cream-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Historical Flyer</span>
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Historical Venue Right of Refusal Policy */}
      <section className="w-full bg-charcoal-900 py-16 px-4 border-t border-charcoal-800">
        <div className="max-w-4xl mx-auto space-y-4 bg-charcoal-950 border border-charcoal-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-terracotta-400" />
            <h3 className="text-xl font-semibold text-cream-50">
              Historical Policy: Venue Right of Refusal
            </h3>
          </div>
          <p className="text-sm sm:text-base text-cream-300 font-light leading-relaxed">
            As documented in Liminal&apos;s original <em>Event Guidelines and Agreements</em>:
            &ldquo;Liminal Flagstaff is a radical community space. As such, the space will reject any groups
            or individuals that propose, host, curate or have a history of supporting oppressive ideals or materials.
            We, as an events venue, reserve the right to reject any events that are not in line with the values of the
            space and its patrons, volunteers, and board members.&rdquo;
          </p>
          <p className="text-xs text-cream-400 font-mono pt-1">
            Source: Event Guidelines.docx &bull; Liminal Operational Archive
          </p>
        </div>
      </section>

      {/* Navigation Footer Banner */}
      <section className="w-full bg-terracotta-500 text-cream-50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-2xl font-semibold">Explore the Archival Photo Gallery</h3>
            <p className="text-cream-100 text-sm mt-1">
              Browse original photographs of community dinners, art nights, and the cafe interior.
            </p>
          </div>
          <Link
            href="/archive"
            className="px-6 py-3 rounded-full bg-charcoal-950 text-cream-50 hover:bg-charcoal-900 font-medium text-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <span>Photo Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Flyer Modal Lightbox */}
      {selectedFlyer && selectedFlyer.flyerSrc && (
        <ArchiveDialog
          title={`Historical Flyer: ${selectedFlyer.title}`}
          onClose={() => setSelectedFlyer(null)}
        >
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-cream-50">{selectedFlyer.title}</h3>
                <span className="text-xs text-terracotta-300 font-mono">{selectedFlyer.dateStr}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlyer(null)}
                aria-label="Close dialog"
                className="text-cream-400 hover:text-cream-100 p-1.5 rounded-lg hover:bg-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-charcoal-950 border border-charcoal-800">
              <Image
                src={selectedFlyer.flyerSrc}
                alt={selectedFlyer.title}
                fill
                className="object-contain"
              />
            </div>

            <p className="text-xs text-cream-300 font-light leading-relaxed">
              {selectedFlyer.description}
            </p>
          </div>
        </ArchiveDialog>
      )}
    </div>
  );
}
