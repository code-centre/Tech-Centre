"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Clock, Car, ExternalLink, MessageCircle } from "lucide-react";
import type { ElementType } from "react";
import SparkEyebrow from "../SparkEyebrow";
import Reveal from "../Reveal";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Tech+Centre&query_place_id=ChIJv01Wyvot9I4RUtzmOXikbpM";
const WHATSAPP_URL =
  "https://wa.me/573005523872?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20los%20programas%20de%20Tech%20Centre";
const EMBED_MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3916.538907882707!2d-74.8045491!3d10.9981343!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42d0ad033385b%3A0x326de6a0f5244065!2sCra.%2050%20%2372-126%2C%20Nte.%20Centro%20Historico%2C%20Barranquilla%2C%20Atl%C3%A1ntico!5e0!3m2!1ses-419!2sco!4v1736454294702!5m2!1ses-419!2sco";

const details: { icon: ElementType; title: string; lines: string[] }[] = [
  {
    icon: MapPin,
    title: "Dirección",
    lines: ["Cra. 50 #72-126, El Prado, Barranquilla", "Casa de la Tecnología"],
  },
  {
    icon: Clock,
    title: "Horario",
    lines: ["Lunes a Viernes 8:00 AM a 6:00 PM", "Sábados 9:00 AM a 1:00 PM"],
  },
  {
    icon: Car,
    title: "Cómo llegar",
    lines: ["Cerca del estadio Romelio Martínez", "Parqueadero disponible"],
  },
];

export default function Visitanos() {
  const reduce = useReducedMotion();

  return (
    <section
      id="visitanos"
      className="relative py-24 md:py-28"
      aria-labelledby="visitanos-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <SparkEyebrow>Visítanos</SparkEyebrow>
              <h2
                id="visitanos-title"
                className="lv2-display mt-5 text-4xl text-[var(--paper)] sm:text-5xl"
              >
                Clases presenciales. Comunidad activa. Cupos limitados.
              </h2>
            </Reveal>

            <ul className="mt-8 space-y-5">
              {details.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={i * 0.08}>
                    <li className="flex items-start gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-[var(--paper)]">
                          {item.title}
                        </h3>
                        {item.lines.map((line) => (
                          <p key={line} className="text-sm lv2-soft">
                            {line}
                          </p>
                        ))}
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ul>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lv2-btn"
                >
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                  Abrir en Google Maps
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lv2-btn-secondary"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Escribir por WhatsApp
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal glow>
            <motion.figure
              className="relative m-0 h-[320px] overflow-hidden rounded-2xl border border-[var(--line)] md:h-[440px]"
              initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src="/community/sede-codigo-abierto.webp"
                alt="Fachada de Casa Tech, la sede de Tech Centre en Barranquilla"
                fill
                sizes="(max-width: 1024px) 100vw, 620px"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(7,16,13,0.9))]"
              />
              <figcaption className="lv2-mono absolute bottom-5 left-6 !text-[var(--mint)]">
                Casa Tech · El Prado, Barranquilla
              </figcaption>
            </motion.figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
