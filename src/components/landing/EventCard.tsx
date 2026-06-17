"use client";

import { Calendar, MapPin, ArrowUpRight } from "lucide-react";

export interface EventItem {
  name: string;
  date: string;
  place: string;
  href: string;
}

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <a
      href={event.href}
      target="_blank"
      rel="noopener noreferrer"
      className="lv2-card group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1"
    >
      <span className="lv2-mono flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[var(--mint)]" aria-hidden="true" />
        {event.date}
      </span>
      <h3 className="lv2-display mt-3 text-xl text-[var(--paper)]">{event.name}</h3>
      <p className="mt-2 flex items-center gap-2 text-sm lv2-soft">
        <MapPin className="h-4 w-4 text-[var(--mint)]" aria-hidden="true" />
        {event.place}
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-[var(--mint)]">
        Ver evento
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </span>
    </a>
  );
}
