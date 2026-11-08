import type { Metadata } from "next";
import "./globals.css";
import { ArchiveBanner } from "@/components/public/ArchiveBanner";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Liminal Community Center & Cafe — Flagstaff, AZ (Historical Archive)",
  description:
    "Historical archive and digital exhibition commemorating Liminal Community Center & Cafe (2021–2023), a radical nonprofit community living room and pay-what-you-can cafe in Flagstaff, Arizona.",
  icons: {
    icon: [
      { url: "/images/branding/favicon-100x100.png", sizes: "100x100", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/images/branding/favicon-100x100.png", sizes: "100x100", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth bg-charcoal-950 text-cream-100">
      <body className="min-h-screen flex flex-col font-sans selection:bg-terracotta-500 selection:text-cream-50 bg-charcoal-950">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-charcoal-950 focus:p-4">Skip to content</a>
        <ArchiveBanner />
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
