import type { Metadata } from "next";
import { PageHero } from "@/components/public/PageHero";
import { ArchedPhoto } from "@/components/public/ArchedPhoto";
import { VOLUNTEER_TEAMS } from "@/data/community";

export const metadata: Metadata = {
  title: "Community — Liminal Historical Archive",
  description: "How people took part in Liminal's cafe, events, and volunteer teams from 2021 to 2023.",
};

export default function CommunityPage() {
  return (
    <div className="w-full bg-charcoal-950 text-cream-100">
      <PageHero eyebrow="Historical Archive • 2021–2023" title="Community" subtitle="People took part as volunteers, workshop hosts, artists, and visitors." />
      {/* 3. The Volunteer Model Narrative & Arched Photo */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 max-w-sm mx-auto lg:max-w-none w-full order-2 lg:order-1">
            <ArchedPhoto
              src="/images/archival/community-portrait.jpg"
              alt="Two smiling volunteers standing beside the handcrafted communal table at Liminal"
              caption="Liminal community participants · Archival photo"
            />
          </div>

          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
              Taking Part
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-semibold text-cream-50 leading-tight">
              People helped in different ways
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-cream-200/90 font-light leading-relaxed">
              <p>Volunteers helped run the cafe and organize events. People also took part by sharing skills, making art, and helping assemble free harm reduction kits.</p>
              <p>Liminal invited people to join teams based on their interests. Team members worked together to coordinate their activities, and a willingness to participate and learn was encouraged.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-charcoal-900 border-y border-charcoal-800 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-semibold text-cream-50">Autonomous Volunteer Teams</h2>
            <p className="text-cream-300 font-light leading-relaxed">The archived volunteer page described teams whose members coordinated their work together. These are some of the activities documented in Liminal&apos;s records.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VOLUNTEER_TEAMS.map((team) => (
              <article key={team.id} className="p-7 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3">
                <h3 className="text-xl font-semibold text-cream-50">{team.name}</h3>
                <p className="text-sm text-cream-300 font-light leading-relaxed">{team.description}</p>
              </article>
            ))}
          </div>
          <p className="mt-10 text-sm text-cream-300">Liminal closed in 2023. This is a record of past participation; volunteer applications are no longer being accepted.</p>
        </div>
      </section>
    </div>
  );
}
