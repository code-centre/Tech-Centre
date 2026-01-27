import { Pencil, MapPin } from 'lucide-react';
import { useState } from 'react';
import useUserStore from '../../../store/useUserStore';
import LocationModalEditing from './LocationModalEditing';

export default function Location() {
    return (
        <div className="max-w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MapPin className="text-zuccini" size={24} />
                    Lugar
                </h2>
                {/* {isAdmin && (
                    <button 
                        onClick={() => setLocationModalOpen(true)}
                        className="bg-zuccini hover:bg-blue-600 transition-colors p-2 rounded-full"
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
                    <h3 className="font-bold text-xl pb-2 text-zuccini">Código Abierto</h3>
                    <p className="leading-relaxed text-gray-300">
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
