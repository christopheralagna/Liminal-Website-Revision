import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/public/PageHero";

export const metadata: Metadata = {
  title: "The Cafe — Liminal Historical Archive",
  description: "Liminal's volunteer-run, pay-what-you-can cafe in Flagstaff, Arizona (2021–2023).",
};

export default function CafePage() {
  return (
    <div className="w-full bg-charcoal-950 text-cream-100">
      <PageHero eyebrow="Historical Archive • 2021–2023" title="The Cafe" subtitle="Coffee, tea, and food at a pay-what-you-can community cafe." />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] max-w-md w-full mx-auto rounded-2xl overflow-hidden border border-charcoal-800 bg-charcoal-900">
            <Image src="/images/archival/cafe-bar.jpg" alt="Preparing a drink at Liminal's cafe counter" fill priority sizes="(max-width: 1024px) 100vw, 450px" className="object-cover" />
          </div>
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">Pay What You Can</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-cream-50">Everyone was welcome</h2>
            <div className="space-y-4 text-base sm:text-lg text-cream-200/90 font-light leading-relaxed">
              <p>The volunteer-run cafe offered coffee, tea, and food. Visitors were welcome regardless of their ability to pay.</p>
              <p>Liminal described its approach as “pay high // pay low.” Contributions from people who could give more were intended to help cover costs for people who could give less.</p>
              <p>The cafe was part of the wider community center, alongside art supplies, books, and space for gatherings.</p>
            </div>
            <p className="text-sm text-cream-300 border-t border-charcoal-800 pt-6">Liminal operated from 2021 to 2023 and is now closed. This page describes the former cafe.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
