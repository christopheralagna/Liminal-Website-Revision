import React from "react";
import Link from "next/link";
import { MapPin, Clock, Instagram } from "lucide-react";
import { LiminalLogo } from "./LiminalLogo";

export function Footer() {
  return (
    <footer className="bg-terracotta-600 text-cream-50 border-t border-terracotta-400 pt-16 pb-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-cream-50/25">
          {/* Column 1: Logo & Mission Statement */}
          <div className="md:col-span-2 space-y-4">
            <div className="inline-flex bg-charcoal-950 p-4"><LiminalLogo size="md" /></div>
            <p className="text-cream-100 text-sm leading-relaxed max-w-md pt-2">
              A nonprofit, volunteer-run community living room and pay-what-you-can cafe in
              Flagstaff, Arizona. Operative from 2021 to 2023, centering marginalized voices,
              popular education, mutual aid, and artistic intervention.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/liminal.flagstaff/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-3 rounded-full bg-charcoal-800 text-peach-300 hover:bg-terracotta-500 hover:text-cream-50 text-xs font-medium transition-colors"
                aria-label="Visit Liminal on Instagram"
              >
                <Instagram className="w-4 h-4" />
                <span>@liminal.flagstaff</span>
              </a>
              <span className="text-xs text-cream-100 font-sans">Flagstaff, AZ</span>
            </div>
          </div>

          {/* Column 2: Historical Hours & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-100">
              Historical Location
            </h4>
            <div className="space-y-2 text-sm text-cream-100">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-peach-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-cream-100">Historic Sandstone Building</p>
                  <p>217 S San Francisco St</p>
                  <p>Flagstaff, AZ 86001</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-2">
                <Clock className="w-4 h-4 text-peach-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-cream-100">Historical Operating Hours</p>
                  <p className="text-xs text-cream-100">Tuesday – Sunday</p>
                  <p className="text-xs text-cream-100">1:00 PM – 9:00 PM</p>
                  <p className="text-xs text-cream-100 italic pt-0.5">
                    (Space permanently closed 2023)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-100">
              Archive Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#about" className="text-cream-100 hover:text-peach-200 transition-colors">
                  Our Founding Story
                </Link>
              </li>
              <li>
                <Link href="/#resources" className="text-cream-100 hover:text-peach-200 transition-colors">
                  Community Resources
                </Link>
              </li>
              <li>
                <Link href="/#volunteer" className="text-cream-100 hover:text-peach-200 transition-colors">
                  Volunteer Model
                </Link>
              </li>
              <li>
                <Link href="/#mission" className="text-cream-100 hover:text-peach-200 transition-colors">
                  Operating Overhead & Mission
                </Link>
              </li>
              <li>
                <Link href="/#location" className="text-cream-100 hover:text-peach-200 transition-colors">
                  Historic Space & Location
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Archival Attribution & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-100">
          <p className="flex items-center gap-1.5 text-center sm:text-left">
            <span>Preserving the historical record of Liminal Community Center & Cafe.</span>
          </p>
          <p className="font-sans text-cream-100">
            2021–2023 · Flagstaff, Arizona
          </p>
        </div>
      </div>
    </footer>
  );
}

