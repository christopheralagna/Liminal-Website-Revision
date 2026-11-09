import { ArchiveBanner } from "@/components/public/ArchiveBanner";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-charcoal-950 focus:p-4">Skip to content</a>
    <ArchiveBanner />
    <Header />
    <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
    <Footer />
  </>;
}
