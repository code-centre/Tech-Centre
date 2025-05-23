import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { db } from '../../../firebase';
import { doc } from 'firebase/firestore';
import useUserStore from '../../../store/useUserStore';

interface EventFCA {
    location: {
        description: string;
        mapUrl: string;
        title: string;
    }
}


export default function LocationContainer({ location }: EventFCA) {
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const { user } = useUserStore();

    return (
        <div className="container">
            <h1 className="text-3xl font-bold pb-5">Lugar</h1>
            <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                    (location?.mapUrl || "")
                )}`}
                height={400}
                width={400}
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full rounded-md"
            ></iframe>
            <div className="mb-4">
                <h2 className="font-bold text-3xl py-5">{location?.title}</h2>
                <p className="leading-relaxed text-gray-400">
                    {location?.description}
                </p>
            </div>
        </div>
    )
}
