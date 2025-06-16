import { Pencil, MapPin } from 'lucide-react';
import { useState } from 'react';
import useUserStore from '../../../store/useUserStore';
import LocationModalEditing from './LocationModalEditing';

interface LocationData {
    description: string;
    mapUrl: string;
    title: string;
}

interface Props {
    location: LocationData;
    eventId?: string;
    saveChanges?: (location: LocationData) => Promise<{success: boolean, error?: string}>;
}

export default function LocationContainer({ location, eventId, saveChanges }: Props) {
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const { user } = useUserStore();
    
    const isAdmin = user?.rol === 'admin';
    
    const handleSaveLocation = async (locationData: LocationData) => {
        if (!saveChanges) {
            console.error("No hay función de guardado disponible");
            return { success: false, error: "No se puede guardar: Función de guardado no disponible" };
        }
        
        return await saveChanges(locationData);
    };
    
    const handleLocationCreated = (newLocation: LocationData) => {
        // Este método se llama cuando se crea una nueva ubicación
        console.log("Nueva ubicación creada:", newLocation);
        // La actualización del estado la maneja el componente padre a través de saveChanges
    };

    return (
        <div className="max-w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <MapPin className="text-blueApp" size={24} />
                    Lugar
                </h2>
                {isAdmin && (
                    <button 
                        onClick={() => setLocationModalOpen(true)}
                        className="bg-blueApp hover:bg-blue-600 transition-colors p-2 rounded-full"
                    >
                        <Pencil className="w-4 h-4 text-white" />
                    </button>
                )}
            </div>
            
            <div className="space-y-6">
                <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                        (location?.mapUrl || "")
                    )}`}
                    height={400}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full rounded-md"
                ></iframe>
                
                <div className="mb-4">
                    <h3 className="font-bold text-xl pb-2 text-blueApp">{location?.title}</h3>
                    <p className="leading-relaxed text-gray-300">
                        {location?.description}
                    </p>
                </div>
            </div>
            
            {locationModalOpen && (
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
            )}
        </div>
    )
}
