import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Coffee,
  Heart,
  Users,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { ResourceCarousel } from "@/components/public/ResourceCarousel";
import { ArchedPhoto } from "@/components/public/ArchedPhoto";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* =========================================================================
          1. HERO SECTION: Full-width Terracotta Banner & Subtitle
          Source Reference: Screenshot 2026-11-07 at 4.02.52 PM.png
         ========================================================================= */}
      <section className="w-full bg-charcoal-950 pb-2">
        {/* Full-width Terracotta Statement Banner */}
        <div className="w-full bg-terracotta-500 py-8 sm:py-10 px-5">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-4xl font-semibold tracking-tight text-cream-50 font-sans">
              A People&apos;s Cafe & Community Center
            </h1>
          </div>
        </div>

        {/* Sub-tagline on Deep Charcoal */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 text-center">
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-peach-300 leading-relaxed">
            A free mixed-use space, run entirely by volunteers.
            Sustained by donations. Made by the people who gathered here.
          </p>
          <div className="w-full h-[1px] bg-terracotta-500/40 mx-auto mt-6 sm:mt-8" />
        </div>
      </section>

      {/* =========================================================================
          2. OPEN HOURS & HISTORICAL LOCATION
          Source Reference: Screenshot 2026-11-07 at 4.03.02 PM.png
         ========================================================================= */}
      <section id="location" className="w-full bg-charcoal-950 pt-6 pb-12 sm:pt-8 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Authentic Communal Table Photo */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden bg-charcoal-900">
                <Image
                  src="/images/archival/NOAZ-book-fest.png"
                  alt="People gathered at the Northern Arizona Book Festival at Liminal"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-sm text-cream-300">People gathered at the Northern Arizona Book Festival at Liminal</p>
            </div>

            {/* Right: Hours & Location Details */}
            <div className="lg:col-span-5 space-y-8 lg:pl-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-peach-300" />
                  <h2 className="text-2xl sm:text-3xl font-semibold text-peach-300 tracking-wide">
                    Historical Hours
                  </h2>
                </div>
                <div className="text-cream-200 text-lg sm:text-xl font-normal pl-7 space-y-1">
                  <p>Tuesday – Sunday</p>
                  <p className="font-medium text-cream-100">1 PM – 9 PM</p>
                  <p className="text-xs text-cream-400 pt-1 font-mono">
                    *Historical operating hours during 2021–2023
                  </p>
                </div>
              </div>

              <div className="w-16 h-[1px] bg-charcoal-800" />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-peach-300" />
                  <h2 className="text-2xl sm:text-3xl font-semibold text-peach-300 tracking-wide">
                    Our Flagstaff Home
                  </h2>
                </div>
                <div className="text-cream-200 text-lg sm:text-xl font-normal pl-7 space-y-1">
                  <p className="text-cream-100 font-medium">Historic Sandstone Building</p>
                  <p>217 S San Francisco St</p>
                  <p>Flagstaff, AZ 86001</p>
                  <p className="text-xs text-cream-400 pt-1">
                    Southside historic district, walking distance from downtown Flagstaff
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. COMMUNITY RESOURCES CAROUSEL
          Source Reference: Screenshot 2026-11-07 at 4.03.09 PM.png & 4.03.40 PM.png
         ========================================================================= */}
      <section id="resources" className="w-full bg-charcoal-900 py-12 sm:py-16 border-y border-terracotta-500/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
              Shared community resources
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-peach-300 mt-2">
              A little room for everyone.
            </h2>
            <p className="text-sm sm:text-base text-cream-300 max-w-2xl mt-2 font-normal">
              Every resource at Liminal was maintained through community mutual aid, sliding-scale
              contributions, and volunteer labor.
            </p>
          </div>

          {/* The Resource Carousel */}
          <ResourceCarousel />
        </div>
      </section>

      {/* =========================================================================
          4. VOLUNTEERING SECTION: Arched Photo & Community Ownership
          Source Reference: Screenshot 2026-11-07 at 4.03.48 PM.png & 4.08.00 PM.png
         ========================================================================= */}
      <section id="volunteer" className="w-full bg-charcoal-950 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Masonry Arched Window Frame */}
            <div className="lg:col-span-5 max-w-sm mx-auto lg:max-w-none w-full order-2 lg:order-1">
              <ArchedPhoto
                src="/images/archival/community-portrait.jpg"
                alt="Two smiling participants beside a table at Liminal"
                caption="A moment from the art therapy workshop photo archive"
              />
            </div>

            {/* Right: Volunteering Callout & Details */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
                Built together, cared for together
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-4xl font-semibold text-cream-50 leading-tight">
                A space made by its people.
              </h2>
              <p className="text-cream-200 text-base sm:text-lg leading-relaxed font-normal">
                Behind the scenes, Liminal was only made possible by a team of creatives, community
                advocates, and organizers who worked together to make things operate day-to-day. From
                event coordination to social media, carpentry, plant care, and barista shifts—we
                recruited by autonomous teams rather than rigid corporate roles.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                <div className="flex items-center gap-2.5 py-2 border-b border-terracotta-500/30">
                  <Coffee className="w-5 h-5 text-peach-300 flex-shrink-0" />
                  <span className="text-sm text-cream-200">Free Third-Wave Barista Training</span>
                </div>
                <div className="flex items-center gap-2.5 py-2 border-b border-terracotta-500/30">
                  <Users className="w-5 h-5 text-peach-300 flex-shrink-0" />
                  <span className="text-sm text-cream-200">Autonomous Volunteer Teams</span>
                </div>
                <div className="flex items-center gap-2.5 py-2 border-b border-terracotta-500/30">
                  <Heart className="w-5 h-5 text-peach-300 flex-shrink-0" />
                  <span className="text-sm text-cream-200">People Over Profit Culture</span>
                </div>
                <div className="flex items-center gap-2.5 py-2 border-b border-terracotta-500/30">
                  <Calendar className="w-5 h-5 text-peach-300 flex-shrink-0" />
                  <span className="text-sm text-cream-200">Flexible 4-Hour Weekly Shifts</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/community"
                  className="px-7 py-3 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-cream-50 font-medium text-sm transition-all shadow-md shadow-terracotta-600/30 flex items-center gap-2"
                >
                  <span>Explore Volunteer Teams</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-3 rounded-full border border-peach-300/40 text-peach-300 hover:bg-peach-300/10 font-medium text-sm transition-colors"
                >
                  Our Philosophy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. MISSION & HISTORICAL FINANCIAL TRANSPARENCY
          Source Reference: Screenshot 2026-11-07 at 4.03.48 PM.png & 4.08.19 PM.png
         ========================================================================= */}
      <section id="mission" className="w-full bg-charcoal-900 py-16 sm:py-24 border-y border-charcoal-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Text & Cost Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
                Community support
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-4xl font-semibold text-peach-300 leading-tight">
                Community kept the doors open.
              </h2>
              <p className="text-cream-200 text-base sm:text-lg leading-relaxed font-normal">
                All facets of Liminal were free to access or pay-what-you-can, including the physical
                space, material resources, and community workshops. The project depended on community
                donations and financial transparency.
              </p>

              {/* Historical Cost Cards */}
              <div className="border-t border-terracotta-500/40 pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-cream-50 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-terracotta-400" />
                  What were the basic costs of keeping Liminal open?
                </h3>
                <ul className="space-y-3 text-sm text-cream-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-terracotta-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cream-100">Rent & Utilities:</strong> Our highest cost
                      of operating exceeded <strong>$3,000 every month</strong>. This overhead was
                      sustained through community donations, bake sales, and benefit events.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-terracotta-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cream-100">Kitchen & Interior Renovations:</strong>{" "}
                      Community repairs, plumbing improvements, and health & safety compliance.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-terracotta-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cream-100">Cafe Supplies:</strong> Fair-trade coffee beans,
                      organic tea blends, oat milk, and cleaning supplies.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Interactive Menu Trigger */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/cafe"
                  className="px-6 py-3 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-cream-50 font-medium text-sm transition-colors shadow-md shadow-terracotta-600/20 flex items-center gap-2"
                >
                  <Coffee className="w-4 h-4" />
                  <span>View Historical Café &amp; Equity Model</span>
                </Link>
              </div>
            </div>

            {/* Right: Authentic Cafe Bar Photo */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[16/9] lg:aspect-[4/5] w-full rounded-sm overflow-hidden bg-charcoal-950">
                <Image
                  src="/images/archival/community-class.jpg"
                  alt="People reading and working together at shared tables in Liminal’s plant-filled cafe"
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-sm text-cream-300 leading-relaxed">Shared tables, shared possibilities. Community support sustained this free space for learning and gathering.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="archive-art-title" className="bg-olive-900 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-peach-200 font-semibold">From the community noticeboard</p>
            <h2 id="archive-art-title" className="text-3xl sm:text-4xl text-peach-200 font-semibold mt-3">Many voices. One shared space.</h2>
            <p className="text-cream-200 leading-relaxed mt-5 max-w-md">Art parties, music, workshops, and time together. The posters made for Liminal tell their own part of the story.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center px-2 py-3">
            <figure className="-rotate-3">
              <Image src="/images/archival/renegade-art-party.jpg" alt="Hand-drawn Renegade Art Party poster with colorful cutout lettering" width={640} height={640} className="w-full h-auto" />
              <figcaption className="mt-3 text-xs text-cream-200">Renegade Art Party · Archive poster</figcaption>
            </figure>
            <figure className="rotate-3 mt-8">
              <Image src="/images/archival/flyer-queer-game-night.jpg" alt="Queer Game Night event flyer" width={640} height={640} className="w-full h-auto" />
              <figcaption className="mt-3 text-xs text-cream-200">Queer Game Night · Archive poster</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FOUNDING PHILOSOPHY & HISTORICAL BUILDING
          Source Reference: Screenshot 2026-11-07 at 4.05.05 PM.png
         ========================================================================= */}
      <section id="about" className="w-full bg-charcoal-950 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Terracotta Header Callout */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-400">
              The Meaning of Liminal
            </span>
            <p className="mt-4 font-serif italic text-xl sm:text-2xl text-peach-200 leading-relaxed">
              &ldquo;The word &lsquo;liminal&rsquo; describes something that is difficult to define or
              categorize because it exists <span className="underline decoration-terracotta-500">in-between</span>{" "}
              things that are more familiar to us.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left: Exterior Historic Sandstone Building */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden bg-charcoal-900">
                <Image
                  src="/images/archival/front-of-building.jpg"
                  alt="Sandstone entrance at 217 S San Francisco St, with HEAD SPACE lettering above the door and a Liminal chalkboard outside"
                  fill
                  sizes="(max-width: 1024px) 100vw, 550px"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-sm text-cream-300">217 S San Francisco St · Archive photo; date unknown</p>
            </div>

            {/* Right: Narrative Excerpt */}
            <div className="lg:col-span-6 space-y-5 text-cream-200 font-normal text-base sm:text-lg leading-relaxed">
              <h3 className="text-2xl sm:text-3xl font-semibold text-cream-50 font-sans">
                A Space Conceived Outside Profit
              </h3>
              <p>
                Liminal was conceived while confronting the reality that modern social spaces are
                almost universally commercialized and profit-driven. Coffee shops and gathering places
                frequently exclude working-class and marginalized people through high prices and soft
                policing.
              </p>
              <p>
                Inspired by radical public spaces and popular education movements, two Flagstaff locals
                devised an exploratory social alternative: a space that prioritized people over profit,
                offering free arts, nutritious meals on sliding scales, radical literature, and mutual aid.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-peach-300 hover:text-peach-100 font-medium text-sm group"
                >
                  <span>Read the full founding narrative &amp; essays</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

