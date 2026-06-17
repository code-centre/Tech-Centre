import type { Metadata } from "next";
import { MapPin, Clock, Car, Phone, Mail, MessageCircle } from "lucide-react";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import ContactoForm from "./ContactoForm";
import { CONTACT } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Contacto · Visítanos en la Casa Tech",
  description:
    "Visítanos en la Casa Tech, El Prado, Barranquilla. Escríbenos por WhatsApp o déjanos tus datos y te orientamos para elegir tu programa.",
};

const datos = [
  { icon: MapPin, title: "Dónde estamos", text: CONTACT.address },
  { icon: Clock, title: "Horario", text: "Lunes a viernes · 8:00 a.m. a 6:00 p.m." },
  { icon: Car, title: "Cómo llegar", text: "Cerca del estadio Romelio Martínez. Cuenta con parqueadero en la zona." },
];

export default function ContactoPage() {
  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="Contacto"
        title={
          <>
            Visítanos en la{" "}
            <span className="lv2-mint">Casa Tech.</span>
          </>
        }
        subtitle="¿No sabes qué programa elegir? Escríbenos y te orientamos."
      />

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Info + mapa */}
          <div>
            <ul className="space-y-4">
              {datos.map((d, i) => {
                const Icon = d.icon;
                return (
                  <Reveal key={d.title} delay={i * 0.06}>
                    <li className="lv2-card flex items-start gap-4 p-5">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-[var(--paper)]">{d.title}</p>
                        <p className="mt-1 text-sm lv2-soft">{d.text}</p>
                      </div>
                    </li>
                  </Reveal>
                );
              })}
            </ul>

            <Reveal className="mt-5">
              <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
                <iframe
                  src={CONTACT.embedMapUrl}
                  title="Ubicación de Tech Centre en el mapa"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Reveal>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="lv2-btn flex-1">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Abrir en Google Maps
              </a>
              <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="lv2-btn-secondary flex-1">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm lv2-soft">
              <a href={`tel:+${CONTACT.whatsapp}`} className="inline-flex items-center gap-2 hover:text-[var(--mint)]">
                <Phone className="h-4 w-4 text-[var(--mint)]" aria-hidden="true" />
                {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 hover:text-[var(--mint)]">
                <Mail className="h-4 w-4 text-[var(--mint)]" aria-hidden="true" />
                {CONTACT.email}
              </a>
            </div>
          </div>

          {/* Formulario */}
          <div>
            <Reveal>
              <ContactoForm />
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
