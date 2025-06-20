"use client";

import { useState } from "react";
import { XIcon, Calendar, Clock, Tag, Type, FileText, DollarSign } from "lucide-react";
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { generateSlug } from "@/../utils/generateSlug";
import AlertModal from "./AlertModal";

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreate: (event: {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    type: string;
    cost: string;
    slug: string;
    createdAt: string;
    status: string | null
    heroImage: string | null
    startHour: string
  }) => void;
}

export default function EventCreationModal({ isOpen, onClose, onEventCreate }: EventCreationModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState<string | null>(null);
  const [startHour, setStartHour] = useState<string>("10:00");
  const [type, setType] = useState("");
  const [cost, setCost] = useState("");
  const [alertModal, setAlertModal] = useState({
    modalOpen: false,
    title: "",
    description: "",
  });

  const showAlert = (title: string, description: string) => {
    setAlertModal({
      modalOpen: true,
      title,
      description,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const eventsRef = collection(db, "events");
      const newEventRef = doc(eventsRef);
      const eventId = newEventRef.id;

      const slug = generateSlug(title);

      const eventData = {
        id: eventId,
        title,
        subtitle,
        date,
        type,
        cost,
        slug,
        heroImage: null,
        startHour,
        createdAt: serverTimestamp(),
        status,
      };

      await setDoc(newEventRef, eventData);

      const clientEventData = {
        ...eventData,
        createdAt: new Date().toISOString(),
      };
      onEventCreate(clientEventData);

      showAlert(
        "Evento creado",
        "El evento ha sido creado con éxito"
      );

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el evento");
      console.error("Error creating event:", err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAlertClose = () => {
    setAlertModal(prev => ({ ...prev, modalOpen: false }));
    setTitle("");
    setSubtitle("");
    setDate("");
    setType("");
    setStatus("draft");
    onClose();
  };


  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-gradient-to-br from-slate-900 to-bgCard rounded-xl p-8 max-w-lg w-full relative text-white shadow-2xl border border-slate-800">
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
              <div className="text-center">
                <svg
                  className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-blue-400 font-semibold">Creando curso...</p>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Crear nuevo curso especializado</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-red-400 transition-all duration-300 p-2 rounded-full hover:bg-red-500/10" 
              disabled={isLoading}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                <Type className="w-4 h-4 mr-2" />
                Título del curso
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200"
                required
                disabled={isLoading}
                placeholder="Ej: Desarrollo Web Avanzado"
              />
            </div>
            <div className="group">
              <label htmlFor="subtitle" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                Subtítulo del curso
              </label>
              <input
                type="text"
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200"
                required
                disabled={isLoading}
                placeholder="Ej: Aprende las últimas tecnologías web"
              />
            </div>
            <div className="group">
              <label htmlFor="types" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                <Tag className="w-4 h-4 mr-2" />
                Tipo de curso
              </label>
              <select
                name="tipos"
                id="types"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200 cursor-pointer appearance-none"
                required
                disabled={isLoading}
                onChange={(e) => setType(e.target.value.toLowerCase())}
              >
                <option value="Curso especializado">Curso especializado</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="date" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha del Evento
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-all duration-200"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="group">
                <label htmlFor="time" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                  <Clock className="w-4 h-4 mr-2" />
                  Hora de inicio
                </label>
                <input
                  type="time"
                  id="time"
                  defaultValue={startHour}
                  onChange={(e) => {
                    setStartHour(e.target.value)
                  }}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-all duration-200"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="group">
              <label htmlFor="cost" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                <DollarSign className="w-4 h-4 mr-2" />
                Costo del curso
              </label>
              <select
                name="costo"
                id="cost"
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200 cursor-pointer appearance-none"
                onChange={(e) => { setCost(e.target.value.toLowerCase()); }}
                disabled={isLoading}
              >
                <option value="">Selecciona un costo</option>
                <option value="gratis">Gratis</option>
                <option value="pago">Pago</option>
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg
                           hover:from-blue-500 hover:to-blue-400 transform hover:-translate-y-0.5 
                           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:ring-offset-2 focus:ring-offset-slate-900
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                           shadow-lg shadow-blue-700/30"
                disabled={isLoading}
              >
                {isLoading ? "Creando..." : "Crear Evento"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <AlertModal
        isOpen={alertModal.modalOpen}
        onClose={handleAlertClose}
        title={alertModal.title}
        description={alertModal.description}
      />
    </>
  );
}

