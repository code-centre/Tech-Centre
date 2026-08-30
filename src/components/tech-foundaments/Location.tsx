import { Pencil, MapPin } from 'lucide-react';
import { useState } from 'react';
import useUserStore from '../../../store/useUserStore';
import LocationModalEditing from './LocationModalEditing';

export default function Location() {
    return (
        <section className="flex flex-col gap-7">
            <div className="flex flex-col gap-3 max-w-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    Dónde se dicta
                </span>
                <h2 className="font-highlight text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2.5 card-text-primary">
                    <MapPin className="text-secondary" size={28} />
                        Sede de Tech Centre
                </h2>
                {/* {isAdmin && (
                    <button 
                        onClick={() => setLocationModalOpen(true)}
                        className="bg-secondary hover:bg-blue-600 transition-colors p-2 rounded-full"
                    >
                        <Pencil className="w-4 h-4 text-white" />
                    </button>
                )} */}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5 items-stretch">
                <div className="overflow-hidden rounded-2xl border border-gray-300 dark:border-border-color min-h-[320px]">
                    <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                            "Cra 50 #72-126"
                        )}`}
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full min-h-[320px]"
                    ></iframe>
                </div>

                <div className="flex flex-col gap-3 p-6 md:p-7 rounded-2xl bg-(--card-diplomado-bg) border border-gray-300 dark:border-border-color">
                    <span className="text-sm font-semibold card-text-primary">Cra 50 #72-126, El Prado</span>
                    <h3 className="font-bold text-xl card-text-primary">Código Abierto</h3>
                    <p className="text-[15px] leading-relaxed card-text-muted">
                        La Sede de Código Abierto es el epicentro tecnológico de la Costa, impulsando la innovación y colaboración en torno a la tecnología. A través de talleres, eventos y proyectos disruptivos, promueve la cultura de código abierto y fortalece el ecosistema digital de la región.
                    </p>
                </div>
            </div>
            
            {/* {locationModalOpen && (
                <LocationModalEditing 
                    isOpen={locationModalOpen}
                    onClose={() => setLocationModalOpen(false)}
                    eventId={eventId || ''}
                    eventData={{
                        id: eventId || '',
                        title: location?.title || '',
                        description: location?.description || '',
                        mapUrl: location?.mapUrl || ''
                    }}
                    onLocationCreate={handleLocationCreated}
                    onSaveLocation={handleSaveLocation}
                />
            )} */}
        </section>
    )
}
