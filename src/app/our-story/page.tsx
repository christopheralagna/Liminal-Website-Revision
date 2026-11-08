import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { BookOpen, Coffee, Heart, Users, Sparkles, ArrowRight } from "lucide-react";
import { HISTORICAL_ESSAYS } from "@/data/essays";

export const metadata: Metadata = {
  title: "Our Story — Liminal Community Center & Cafe Historical Archive",
  description:
    "The founding narrative, core philosophy, and original essays behind Liminal Community Center & Cafe in Flagstaff, Arizona (2021–2023).",
};

export default function OurStoryPage() {
  const alagnaEssay = HISTORICAL_ESSAYS.find((e) => e.id === "why-cafe-in-arts-center")!;
  const mcelligottEssay = HISTORICAL_ESSAYS.find((e) => e.id === "identity-politics-and-art")!;

  return (
    <div className="w-full bg-charcoal-950 text-cream-100">
      {/* Page Title & Terracotta Banner */}
      <section className="w-full pt-10 sm:pt-14 pb-8 border-b border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
            Historical Archive • 2021–2023
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-cream-50">
            Our Story &amp; Philosophy
          </h1>
          <p className="text-lg sm:text-xl text-peach-300 font-light max-w-2xl mx-auto leading-relaxed">
            Conceived while confronting the reality that modern social spaces are fundamentally
            driven by profit and exclusion.
          </p>
        </div>
      </section>

      {/* The Definition of "Liminal" */}
      <section className="w-full py-12 sm:py-16 bg-charcoal-900 border-b border-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <blockquote className="border-l-4 border-terracotta-400 pl-6 sm:pl-8 py-2 my-4">
            <p className="font-serif italic text-2xl sm:text-3xl text-peach-200 leading-snug">
              &ldquo;The word &lsquo;liminal&rsquo; describes something that is difficult to define
              or categorize because it exists{" "}
              <span className="text-cream-50 underline decoration-terracotta-400 underline-offset-4">
                in-between
              </span>{" "}
              things that are more familiar to us.&rdquo;
            </p>
            <footer className="mt-4 text-xs sm:text-sm font-mono text-terracotta-300">
              — Liminal Mission Statement, Flagstaff, Arizona
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Founding Narrative & Exterior Building Photo */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
              The Genesis
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-cream-50 leading-tight">
              A Space Conceived Outside Profit
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-cream-200/90 font-light leading-relaxed">
              <p>
                Liminal was conceived while confronting the harsh reality that our society is
                fundamentally driven by profit. Under the rhetorical facade of &ldquo;freedom&rdquo; is
                the right of the owning-class to exploit working-class labor and protect private
                wealth. This is compounded by a long history of white supremacy, cisheteropatriarchy,
                and settler colonialism which continues to suppress marginalized communities.
              </p>
              <p>
                Trying to make sense of the way mindsets are shaped by neoliberal capitalism, two
                Flagstaff locals discussed feeling surrounded by creative stagnation when it came to
                practical community-based social alternatives. Hundreds of creative radical spaces
                have demonstrated class-consciousness by providing affordable food, free creative
                materials, community education, and safe public gathering.
              </p>
              <p>
                Contrary to the strict capitalist logic of starting a &ldquo;successful business&rdquo;,
                the founders felt adamant about making a space that would be exploratory and unfixed,
                rather than predetermined and commercial.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-charcoal-800 bg-charcoal-900 group">
              <Image
                src="/images/archival/front-of-building.jpg"
                alt="Historic sandstone building at 217 S San Francisco St in Flagstaff with painted Liminal signage"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 550px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 bg-charcoal-950/80 backdrop-blur-sm p-3 rounded-lg border border-charcoal-800 text-xs font-mono text-cream-200 flex justify-between items-center">
                <span>217 S San Francisco St</span>
                <span className="text-terracotta-300">Flagstaff Historic Southside</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Core Pillars */}
      <section className="w-full bg-charcoal-900 py-16 sm:py-20 border-y border-charcoal-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
              Guiding Praxis
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-peach-300 mt-2">
              Four Core Organizational Pillars
            </h2>
            <p className="text-cream-300 text-base mt-2 font-light">
              Liminal was structured around concrete practices rather than abstract theory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta-500/20 text-peach-300 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-cream-50">1. Popular Education (Paulo Freire)</h3>
              <p className="text-sm sm:text-base text-cream-300 font-light leading-relaxed">
                Rejection of state-corporate credentialism. Education should not be about professionalizing
                or accruing debt, but about personal and collective liberation. Everyone possesses knowledge
                worth sharing.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta-500/20 text-peach-300 flex items-center justify-center mb-4">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-cream-50">2. People Over Profit</h3>
              <p className="text-sm sm:text-base text-cream-300 font-light leading-relaxed">
                Operating without owners or shareholders extracting surplus value. The pay-what-you-can
                cafe model and sliding-scale events ensured that no one was ever excluded due to poverty or
                lack of expendable income.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta-500/20 text-peach-300 flex items-center justify-center mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-cream-50">3. Mutual Aid & Bodily Autonomy</h3>
              <p className="text-sm sm:text-base text-cream-300 font-light leading-relaxed">
                Free Narcan overdose kits, safer drug use materials, seasonal winter coat drives, and
                open art supplies provided with zero bureaucratic hurdles and 100% recipient anonymity.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta-500/20 text-peach-300 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-cream-50">4. Autonomous Volunteer Teams</h3>
              <p className="text-sm sm:text-base text-cream-300 font-light leading-relaxed">
                A non-hierarchical labor structure where teams (Baristas, Events, Art Curation, Mutual Aid)
                self-coordinated through open Slack channels and weekly in-person assemblies without top-down
                bosses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Essays Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        <div className="text-center space-y-2 border-b border-charcoal-800 pb-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
            Archival Writings
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-cream-50">
            Original Essays by the Co-Founders
          </h2>
          <p className="text-cream-300 text-sm font-mono">
            Published originally on the Liminal website blog in early 2021
          </p>
        </div>

        {/* Essay 1: Christopher Alagna */}
        <article className="space-y-6 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 sm:p-10 shadow-xl">
          <header className="space-y-3 border-b border-charcoal-800 pb-6">
            <span className="text-xs uppercase tracking-widest font-mono text-terracotta-300">
              {alagnaEssay.date}
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold text-peach-300 leading-snug">
              {alagnaEssay.title}
            </h3>
            <p className="text-xs sm:text-sm text-cream-400">
              Written by <strong className="text-cream-100">{alagnaEssay.author}</strong> ({alagnaEssay.authorRole})
            </p>
          </header>

          <div className="space-y-4 text-cream-200/90 font-light leading-relaxed text-base sm:text-lg">
            {alagnaEssay.content.map((paragraph, index) => (
              <p key={index} className={index === 0 ? "font-serif italic text-peach-200" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Essay 2: Ryan McElligott */}
        <article className="space-y-6 bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 sm:p-10 shadow-xl">
          <header className="space-y-3 border-b border-charcoal-800 pb-6">
            <span className="text-xs uppercase tracking-widest font-mono text-terracotta-300">
              {mcelligottEssay.date}
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold text-peach-300 leading-snug">
              {mcelligottEssay.title}
            </h3>
            {mcelligottEssay.subtitle && (
              <h4 className="text-lg text-cream-300 font-serif italic">
                {mcelligottEssay.subtitle}
              </h4>
            )}
            <p className="text-xs sm:text-sm text-cream-400">
              Written by <strong className="text-cream-100">{mcelligottEssay.author}</strong> ({mcelligottEssay.authorRole})
            </p>
          </header>

          <div className="space-y-4 text-cream-200/90 font-light leading-relaxed text-base sm:text-lg">
            {mcelligottEssay.content.map((paragraph, index) => (
              <p key={index} className={index === 0 ? "font-serif italic text-peach-200" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </section>

      {/* Navigation Footer Banner */}
      <section className="w-full bg-terracotta-500 text-cream-50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-2xl font-semibold">Explore Liminal&apos;s Physical Facilities</h3>
            <p className="text-cream-100 text-sm mt-1">
              Tour the cafe bar, free art room, radical library, and multimedia assembly hall.
            </p>
          </div>
          <Link
            href="/facilities"
            className="px-6 py-3 rounded-full bg-charcoal-950 text-cream-50 hover:bg-charcoal-900 font-medium text-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <span>View Facilities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

