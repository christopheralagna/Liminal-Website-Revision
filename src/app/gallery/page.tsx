"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Eye, MapPin, X, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/public/PageHero";
import { ARCHIVAL_PHOTOS, ArchivalPhoto } from "@/data/photos";
import { ArchiveDialog } from "@/components/public/ArchiveDialog";

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePhoto, setActivePhoto] = useState<ArchivalPhoto | null>(null);

  const categories = [
    { key: "all", label: "All Photos" },
    { key: "space", label: "The Space & Rooms" },
    { key: "community", label: "Community Gatherings" },
    { key: "music", label: "Live Music & Culture" },
    { key: "art", label: "Arts & Supplies" },
    { key: "mutual-aid", label: "Mutual Aid" },
  ];

  const filteredPhotos = ARCHIVAL_PHOTOS.filter((photo) => {
    const matchesCategory = selectedCategory === "all" || photo.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.room && photo.room.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-charcoal-950 text-cream-100">
      {/* 1. Page Hero */}
      <PageHero
        eyebrow="Visual Documentation • 2021–2023"
        title="Photo Archive"
        subtitle="Photographs and posters from Liminal’s former community space."
      />

      {/* 2. Historical Notice Banner */}
      <section className="w-full bg-charcoal-900 border-b border-charcoal-800 py-3.5 px-4 text-center">
        <p className="text-xs sm:text-sm text-cream-300">
          <span className="font-semibold text-terracotta-400">Curated Historical Archive:</span>{" "}
          Images from Liminal&apos;s records show the former space and its activities.
          Individual image dates have not been confirmed.
        </p>
      </section>

      {/* 3. Search & Filter Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4 space-y-6">
        {/* Search Input */}
        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-peach-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by room, title, or keywords..."
            aria-label="Search the photo archive"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal-900 border border-charcoal-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-cream-100 placeholder:text-cream-400 focus:outline-none focus:ring-2 focus:ring-peach-300 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-100 p-1"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              aria-pressed={selectedCategory === cat.key}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
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

      {/* 4. Photo Gallery Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-8 max-w-lg mx-auto">
            <p className="text-cream-300 text-base">No historical photos matched your query.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-5 py-2 rounded-full bg-terracotta-500 text-cream-50 text-xs font-medium hover:bg-terracotta-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPhotos.map((photo) => (
              <figure
                key={photo.id}
                className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden cursor-pointer group hover:border-charcoal-700 transition-all duration-200 flex flex-col justify-between"
              >
                {/* Photo Image Frame */}
                <button
                  type="button"
                  onClick={() => setActivePhoto(photo)}
                  aria-label={`View ${photo.title}`}
                  className={`relative block w-full bg-charcoal-950 overflow-hidden ${
                    photo.aspect === "portrait" ? "aspect-[4/5]" : "aspect-[16/11]"
                  }`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-charcoal-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-cream-50 font-medium backdrop-blur-[2px]">
                    <Eye className="w-4 h-4 text-peach-300" />
                    <span>View Large</span>
                  </div>
                </button>

                {/* Caption Details */}
                <figcaption className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-terracotta-300">
                    <span>{photo.categoryLabel}</span>
                  </div>
                  <h3 className="text-base font-semibold text-cream-50 group-hover:text-peach-200 transition-colors">
                    {photo.title}
                  </h3>
                  {photo.room && (
                    <div className="flex items-center gap-1.5 text-xs text-cream-400 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-peach-300 flex-shrink-0" />
                      <span>{photo.room}</span>
                    </div>
                  )}
                  <p className="text-xs text-cream-300 font-light leading-relaxed line-clamp-2 pt-1">
                    {photo.description}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* 5. Navigation Footer Callout */}
      <section className="w-full bg-terracotta-500 text-cream-50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-2xl font-semibold">About the Space</h3>
            <p className="text-cream-100 text-sm mt-1">
              Read about the cafe, community rooms, and activities at Liminal.
            </p>
          </div>
          <Link
            href="/about"
            className="px-6 py-3 rounded-full bg-charcoal-950 text-cream-50 hover:bg-charcoal-900 font-medium text-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <span>Read Our Story</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 6. Lightbox Modal */}
      {activePhoto && (
        <ArchiveDialog
          title={`Archival Photo: ${activePhoto.title}`}
          onClose={() => setActivePhoto(null)}
        >
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-cream-50">{activePhoto.title}</h3>
                <div className="flex items-center gap-3 text-xs text-terracotta-300 font-mono mt-0.5">
                  <span>{activePhoto.categoryLabel}</span>
                  <span>•</span>
                  <span>Flagstaff, AZ</span>
                  {activePhoto.room && (
                    <>
                      <span>•</span>
                      <span>{activePhoto.room}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                aria-label="Close dialog"
                className="text-cream-400 hover:text-cream-100 p-1.5 rounded-lg hover:bg-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Image Frame */}
            <div className="relative aspect-[16/10] max-h-[60vh] w-full rounded-xl overflow-hidden bg-charcoal-950 border border-charcoal-800">
              <Image
                src={activePhoto.src}
                alt={activePhoto.title}
                fill
                priority
                className="object-contain"
              />
            </div>

            <p className="text-sm text-cream-200 font-light leading-relaxed">
              {activePhoto.description}
            </p>
          </div>
        </ArchiveDialog>
      )}
    </div>
  );
}

