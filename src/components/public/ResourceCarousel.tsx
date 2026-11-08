"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResourceItem {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: "cafe",
    title: "Donation-only meals and cafe beverages",
    imageSrc: "/images/archival/cafe-bar.jpg",
    imageAlt: "Wooden cafe counter with chalkboard menu and plants",
  },
  {
    id: "workspace",
    title: "Free workspace... and WIFI!",
    imageSrc: "/images/archival/community-table.png",
    imageAlt: "Empty communal wooden table beside cafe seating",
  },
  {
    id: "events",
    title: "Free and donation-based community events",
    imageSrc: "/images/archival/NOAZ-book-fest.png",
    imageAlt: "People gathered at the Northern Arizona Book Festival at Liminal",
  },
  {
    id: "art-supplies",
    title: "Free art supplies and multimedia equipment",
    imageSrc: "/images/archival/art-room-supplies.webp",
    imageAlt: "Paint tubes arranged in wooden cubbies beneath drawings",
  },
  {
    id: "volunteering",
    title: "Plenty of volunteer opportunities",
    imageSrc: "/images/archival/community-suggestions.jpg",
    imageAlt: "Handwritten chalkboard and community suggestions box surrounded by house plants",
  },
  {
    id: "library",
    title: "Radical books and zine library",
    imageSrc: "/images/archival/radical-library.jpg",
    imageAlt: "People reading and working at cafe tables, with a bookshelf beside the door",
  },
  {
    id: "harm-reduction",
    title: "Free harm reduction kits",
    imageSrc: "/images/archival/harm-reduction-spw.jpg",
    imageAlt: "Community members assembling harm reduction kits around shared tables",
  },
];

export function ResourceCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cards = Array.from(container.children) as HTMLElement[];
    const firstOffset = cards[0]?.offsetLeft ?? 0;
    const nearest = cards.reduce((best, card, index) =>
      Math.abs(card.offsetLeft - firstOffset - container.scrollLeft) <
        Math.abs(cards[best].offsetLeft - firstOffset - container.scrollLeft) ? index : best, 0);
    setPosition(nearest + 1);
    setCanScrollLeft(container.scrollLeft > 2);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    if (scrollContainerRef.current) observer.observe(scrollContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cards = Array.from(container.children) as HTMLElement[];
    const origin = cards[0].offsetLeft;
    const offsets = cards.map(card => card.offsetLeft - origin);
    const destination = direction === "right"
      ? offsets.find(offset => offset > container.scrollLeft + 2) ?? container.scrollWidth
      : offsets.reverse().find(offset => offset < container.scrollLeft - 2) ?? 0;
    container.scrollTo({
      left: destination,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="text-sm text-cream-300" aria-live="polite" aria-atomic="true">
          Resource {position} of {RESOURCES.length}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll("left")} disabled={!canScrollLeft}
            aria-label="Previous resource" aria-controls="resource-cards"
            className="p-3 rounded-full border border-peach-300/50 text-peach-200 hover:bg-olive-800 disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => scroll("right")} disabled={!canScrollRight}
            aria-label="Next resource" aria-controls="resource-cards"
            className="p-3 rounded-full border border-peach-300/50 text-peach-200 hover:bg-olive-800 disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div id="resource-cards" ref={scrollContainerRef} onScroll={checkScroll}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault(); scroll(event.key === "ArrowLeft" ? "left" : "right");
          }
        }}
        className="relative flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
        tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Community resources; use left and right arrow keys to browse">
        {RESOURCES.map((item, index) => (
          <div key={item.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${RESOURCES.length}`}
            className="flex-shrink-0 w-64 sm:w-72 bg-olive-800 p-4 pb-6 flex flex-col items-center text-center snap-start">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden mb-5 bg-charcoal-900">
              <Image src={item.imageSrc} alt={item.imageAlt} fill sizes="(max-width: 640px) 224px, 256px" className="object-cover" />
            </div>
            <h3 className="text-peach-200 font-semibold text-base leading-relaxed">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
