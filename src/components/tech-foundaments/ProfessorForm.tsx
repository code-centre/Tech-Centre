import { useState } from "react";
import SpeakersPhotoUpload from "./ProfessorPhotoUpload";

interface SpeakerFormProps {
  speaker: {
    firstName?: string;
    lastName?: string;
    occupation?: string;
    origin?: string;
    speciality?: string;
    bio?: string;
    linkedin?: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFileChange: (file: File) => void;
  previewUrl: string | null;
}

const SpeakerForm = ({ speaker, onInputChange, onFileChange, previewUrl }: SpeakerFormProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <input
        type="text"
        name="firstName"
        placeholder="Nombre"
        value={speaker.firstName}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="text"
        name="lastName"
        placeholder="Apellido"
        value={speaker.lastName}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <SpeakersPhotoUpload onFileChange={onFileChange} previewUrl={previewUrl} />
      <input
        type="text"
        name="occupation"
        placeholder="Ocupación"
        value={speaker.occupation}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="text"
        name="origin"
        placeholder="Origen"
        value={speaker.origin}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <input
        type="text"
        name="speciality"
        placeholder="Especialidad"
        value={speaker.speciality}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <textarea
        name="bio"
        placeholder="Biografía"
        value={speaker.bio}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
      />
      <input
        type="text"
        name="linkedin"
        placeholder="URL de LinkedIn"
        value={speaker.linkedin}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default SpeakerForm;