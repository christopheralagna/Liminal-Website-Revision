"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LiminalLogo } from "./LiminalLogo";

const NAV_LINKS = [
  { href: "/#about", label: "Our Story" },
  { href: "/#resources", label: "Community Resources" },
  { href: "/#volunteer", label: "Volunteering" },
  { href: "/#mission", label: "Our Mission" },
  { href: "/#location", label: "The Space" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <header onKeyDown={(event) => { if (event.key === "Escape") { setMobileMenuOpen(false); menuButton.current?.focus(); } }} className="bg-charcoal-950/95 border-b border-charcoal-800 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-peach-300 rounded-lg p-1 transition-transform group-hover:scale-[1.01]"
        >
          <LiminalLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-150 py-3 rounded text-peach-200 hover:text-cream-50 focus-visible:ring-2 focus-visible:ring-peach-300"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          ref={menuButton}
          aria-controls="mobile-navigation"
          className="lg:hidden text-cream-200 p-3 rounded-lg hover:bg-charcoal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-peach-300"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto bg-charcoal-900 border-b border-charcoal-800 px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => {
                return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-base border-b border-charcoal-800/60 font-medium text-peach-200 hover:text-cream-50"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
