import React, { useState } from "react";
import Image from "next/image";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { db } from "../../../firebase";
import { UserSearch } from "lucide-react";

interface Speaker {
  id: string;
  firstName: string;
  lastName: string;
  origin: string;
  photoUrl: string;
  occupation: string;
  speciality: string;
}

interface SpeakerSearchProps {
  onSelectSpeaker: (speaker: Speaker) => void;
}

const SpeakerSearch: React.FC<SpeakerSearchProps> = ({ onSelectSpeaker }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Speaker[]>([]);
  const [speakersSnapshot, loading] = useCollection(collection(db, "speakers"));

  const speakers = speakersSnapshot?.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Speaker[] || [];


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filteredResults = speakers.filter(
      (speaker) =>
        speaker.firstName.toLowerCase().includes(term) ||
        speaker.lastName.toLowerCase().includes(term)
    );

    setSearchResults(filteredResults);
  };

  return (
    <div>
      <div className="relative">
        <input
          placeholder="Buscar speaker por nombre o apellido..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        />
        <div className="absolute inset-y-0 left-0 pl-3 mb-4 flex items-center pointer-events-none">
          <UserSearch className="h-6 w-6 text-gray-400" />
        </div>
      </div>
      {loading ? (
      <p>Cargando...</p>
      ) : searchResults.length > 0 ? (
        searchResults.map((speaker) => (
            <div
            key={speaker.id}
            className="p-3 border rounded-md mb-2 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
            onClick={() => onSelectSpeaker(speaker)}
            >
            <div>
              <p className="font-semibold">
              {speaker.firstName} {speaker.lastName}
              </p> 
              <p className="text-sm text-gray-500">{speaker.occupation}</p>
            </div>
            <Image
              src={speaker.photoUrl}
              alt={`${speaker.firstName} ${speaker.lastName}`}
              width={100}
              height={100}
              className="flex-shrink-0 object-cover"
              style={{ width: "100px", height: "100px" }}
            />
            </div>
        ))
      ) : (
      <p>No se encontraron resultados.</p>
      )}
    </div>
  );
};

export default SpeakerSearch;

