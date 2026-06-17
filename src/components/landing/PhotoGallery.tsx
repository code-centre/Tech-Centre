"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

interface Photo {
  src: string;
  alt: string;
  caption: string;
  w: number;
  h: number;
}

interface PhotoGalleryProps {
  mosaic: Photo[];
  marquee: Photo[];
  floatingMark?: string;
}

function MarqueePhoto({ photo }: { photo: Photo }) {
  return (
    <figure className="group relative h-44 w-64 shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] sm:h-56 sm:w-80">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="320px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(7,16,13,0.7))]" />
      <figcaption className="lv2-mono absolute bottom-3 left-3 !text-[var(--mint)]">
        {photo.caption}
      </figcaption>
    </figure>
  );
}

export default function PhotoGallery({ mosaic, marquee, floatingMark }: PhotoGalleryProps) {
  const reduce = useReducedMotion();
  const marqueeLoop = [...marquee, ...marquee];

  return (
    <div className="overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {floatingMark && (
          <span
            aria-hidden="true"
            className="lv2-display pointer-events-none absolute -top-4 right-2 z-20 hidden rotate-[-4deg] text-2xl text-[var(--mint)] md:block"
            style={{ textShadow: "0 0 20px rgba(63,224,160,0.5)" }}
          >
            {floatingMark}
          </span>
        )}

        <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
          {mosaic.map((photo, i) => (
            <motion.figure
              key={photo.src}
              className="group relative block break-inside-avoid overflow-hidden rounded-2xl border border-[var(--line)]"
              initial={{ opacity: 0, scale: reduce ? 1 : 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: (i % 4) * 0.08 }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.w}
                height={photo.h}
                sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw"
                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(7,16,13,0.8))] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <figcaption className="lv2-mono absolute bottom-3 left-3 translate-y-2 !text-[var(--mint)] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {photo.caption}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>

      <div className="lv2-marquee mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)]">
        <ul className="lv2-marquee-track" style={{ "--lv2-marquee-duration": "55s" } as React.CSSProperties}>
          {marqueeLoop.map((photo, i) => (
            <li key={`${photo.src}-${i}`}>
              <MarqueePhoto photo={photo} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
