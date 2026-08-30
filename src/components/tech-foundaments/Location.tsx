import { Pencil, MapPin } from 'lucide-react';
import { useState } from 'react';
import useUserStore from '../../../store/useUserStore';
import LocationModalEditing from './LocationModalEditing';

export default function Location() {
    return (
        <div className="max-w-full bg-(--card-diplomado-bg) rounded-2xl shadow-xl overflow-hidden border [border-color:var(--card-diplomado-border)] dark:border-border-color p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-highlight text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 card-text-primary">
                    <MapPin className="text-secondary" size={26} />
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
            
            <div className="space-y-6">
                <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                        "Cra 50 #72-126"
                    )}`}
                    height={400}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full rounded-md"
                ></iframe>
                
                <div className="mb-4">
                    <h3 className="font-bold text-xl pb-2 card-text-primary">Código Abierto</h3>
                    <p className="leading-relaxed card-text-primary">
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
        </div>
    )
}
