import type { Metadata } from "next";

export const metadata: Metadata = { title: "Liminal Administration", description: "Liminal administrative demonstration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-charcoal-950 text-cream-100">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-charcoal-900 focus:p-4">Skip to content</a>
    {children}
  </div>;
}
