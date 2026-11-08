import React from "react";
import { Info } from "lucide-react";

export function ArchiveBanner() {
  return (
    <aside
      aria-label="Historical Archive Notification"
      className="bg-charcoal-900 border-b border-terracotta-500/30 text-cream-200 text-xs md:text-sm py-2 px-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-peach-300 flex-shrink-0" />
          <p>
            <span className="font-semibold text-peach-200">Historical Archive (2021–2023):</span>{" "}
            A community space in Flagstaff, AZ. Permanently closed; its story lives here.
          </p>
        </div>

      </div>
    </aside>
  );
}

