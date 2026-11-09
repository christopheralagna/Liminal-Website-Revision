import Image from "next/image";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/public/PageHero";
import { FACILITIES } from "@/data/facilities";

export const metadata: Metadata = {
  title: "Our Story — Liminal Historical Archive",
  description: "A look at Liminal, a nonprofit community center and pay-what-you-can cafe in Flagstaff, Arizona, from 2021 to 2023.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-charcoal-950 text-cream-100">
      <PageHero
        eyebrow="Historical Archive • 2021–2023"
        title="Our Story"
        subtitle="Liminal was a nonprofit community center and pay-what-you-can cafe in Flagstaff, Arizona."
      />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">A Community Space</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-cream-50 leading-tight">A place to spend time together</h2>
            <div className="space-y-4 text-base sm:text-lg text-cream-200/90 font-light leading-relaxed">
              <p>Liminal operated at 217 S San Francisco St from 2021 to 2023. People came for coffee and tea, used art supplies, read, worked on projects, and attended community events.</p>
              <p>The aim was to offer a shared space where people could participate regardless of how much money they had. Its nonprofit purpose included making art and learning more accessible, with particular attention to people facing financial barriers or discrimination.</p>
              <p>Community members were invited to share their skills through classes and workshops without needing formal teaching credentials. Volunteers helped run the cafe and organize activities.</p>
              <p>The name reflected a space that sat between familiar categories: part cafe, part arts space, and part community education center. Liminal closed in 2023; this website keeps a record of the space and its activities.</p>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-charcoal-800 bg-charcoal-900">
              <Image src="/images/archival/front-of-building.jpg" alt="Liminal's former building at 217 S San Francisco St" fill priority sizes="(max-width: 1024px) 100vw, 550px" className="object-cover" />
            </div>
            <p className="mt-3 text-xs text-cream-400 text-center">217 S San Francisco St · Flagstaff, Arizona</p>
          </div>
        </div>
      </section>
      {/* 5. The Physical Space & Facilities */}
      <section id="facilities" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
            Around the Center
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-cream-50 mt-2">
            Inside Liminal
          </h2>
          <p className="text-cream-300 text-base sm:text-lg mt-3 font-light">
            The cafe, art supply room, library, and multimedia room gave visitors places to meet,
            read, make art, and take part in events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FACILITIES.map((facility) => (
            <div
              key={facility.id}
              className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-charcoal-700 transition-colors"
            >
              <div>
                <div className="relative aspect-[16/10] w-full bg-charcoal-950 overflow-hidden">
                  <Image
                    src={facility.imageSrc}
                    alt={facility.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-cream-50 group-hover:text-peach-200 transition-colors">
                    {facility.name}
                  </h3>
                  <p className="text-xs font-serif italic text-peach-300">
                    {facility.subtitle}
                  </p>
                  <p className="text-sm text-cream-300 font-light leading-relaxed">
                    {facility.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-charcoal-800/60">
                <ul className="space-y-1.5 text-xs text-cream-300">
                  {facility.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-terracotta-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
