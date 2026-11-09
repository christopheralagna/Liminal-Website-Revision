import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
