import React from "react";
import Image from "next/image";

interface LiminalLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LiminalLogo({ className = "", size = "md" }: LiminalLogoProps) {
  const dimensions = {
    sm: { width: 100, height: 50, classes: "h-9 sm:h-10 w-auto" },
    md: { width: 160, height: 80, classes: "h-14 sm:h-16 w-auto" },
    lg: { width: 240, height: 120, classes: "h-20 sm:h-24 w-auto" },
  };

  const { width, height, classes } = dimensions[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <Image
        src="/images/branding/liminal-logo.png"
        alt="Liminal Cafe & Community Center"
        width={width}
        height={height}
        priority
        className={`${classes} object-contain transition-opacity duration-200 hover:opacity-90`}
      />
    </div>
  );
}
