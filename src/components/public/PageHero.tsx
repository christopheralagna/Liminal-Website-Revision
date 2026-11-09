import React from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
}

export function PageHero({ eyebrow = "Historical Archive • 2021–2023", title, subtitle }: PageHeroProps) {
  return (
    <section className="w-full bg-charcoal-950 pt-12 sm:pt-16 pb-10 sm:pb-14 border-b border-charcoal-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="inline-block text-xs uppercase tracking-widest font-semibold text-terracotta-400 bg-charcoal-900 border border-terracotta-500/20 px-3.5 py-1.5 rounded-full">
          {eyebrow}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-cream-50 font-sans">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-peach-300 font-light max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

