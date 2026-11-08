import React from "react";
import Image from "next/image";

interface ArchedPhotoProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
}

export function ArchedPhoto({
  src,
  alt,
  caption,
  className = "",
  priority = false,
}: ArchedPhotoProps) {
  return (
    <figure className={`flex flex-col items-center ${className}`}>
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-full rounded-b-sm bg-charcoal-900 group">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 500px"
          className="object-cover object-center"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm text-cream-300 text-center leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

