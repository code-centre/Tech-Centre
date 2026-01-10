"use client";

import { useState } from "react";
import { XIcon, Type, FileText, Tag, DollarSign, Clock, BookOpen } from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { generateSlug } from "@/../utils/generateSlug";
import AlertModal from "./AlertModal";
import type { Program } from "@/types/programs";

interface ProgramCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgramCreate: (program: Program) => void;
}

export default function ProgramCreationModal({ isOpen, onClose, onProgramCreate }: ProgramCreationModalProps) {
  const supabase = useSupabaseClient()
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("diplomado");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [totalHours, setTotalHours] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Generar código único desde el nombre
      const code = generateSlug(name);

      // Validar que el código no exista
      const { data: existingProgram } = await supabase
        .from('programs')
        .select('code')
        .eq('code', code)
        .single();

      if (existingProgram) {
        setError('Ya existe un programa con un nombre similar. Por favor, usa un nombre más específico.');
        setIsLoading(false);
        return;
      }

      const programData = {
        name: name.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        code,
        kind: kind.toLowerCase(),
        difficulty,
        total_hours: totalHours ? parseInt(totalHours, 10) : 0,
        default_price: defaultPrice ? parseFloat(defaultPrice) : 0,
        is_active: true,
        syllabus: {},
        image: null,
        schedule: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newProgram, error: insertError } = await supabase
        .from('programs')
        .insert([programData])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message || 'Error al crear el programa');
      }

      onProgramCreate(newProgram as Program);

      showAlert(
        "Programa creado",
        "El programa ha sido creado exitosamente"
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear el programa";
      setError(errorMessage);
      console.error("Error creating program:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertClose = () => {
    setAlertModal(prev => ({ ...prev, modalOpen: false }));
    setName("");
    setSubtitle("");
    setDescription("");
    setKind("diplomado");
    setDifficulty("beginner");
    setTotalHours("");
    setDefaultPrice("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-gradient-to-br from-slate-900 to-bgCard rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative text-white shadow-2xl border border-slate-800">
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
                <p className="text-blue-400 font-semibold">Creando programa...</p>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Crear nuevo programa</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-red-400 transition-all duration-300 p-2 rounded-full hover:bg-red-500/10" 
              disabled={isLoading}
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                <Type className="w-4 h-4 mr-2" />
                Nombre del programa *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200"
                required
                disabled={isLoading}
                placeholder="Ej: Diplomado en Desarrollo Web Full Stack"
              />
            </div>

            <div className="group">
              <label htmlFor="subtitle" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                Subtítulo
              </label>
              <input
                type="text"
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200"
                disabled={isLoading}
                placeholder="Ej: Aprende las últimas tecnologías web"
              />
            </div>

            <div className="group">
              <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200 min-h-[100px] resize-y"
                disabled={isLoading}
                placeholder="Describe el programa..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="kind" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                  <Tag className="w-4 h-4 mr-2" />
                  Tipo de programa *
                </label>
                <select
                  id="kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-all duration-200 cursor-pointer appearance-none"
                  required
                  disabled={isLoading}
                >
                  <option value="diplomado">Diplomado</option>
                  <option value="curso especializado">Curso Especializado</option>
                  <option value="curso corto">Curso Corto</option>
                </select>
              </div>

              <div className="group">
                <label htmlFor="difficulty" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Nivel de dificultad *
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as "beginner" | "intermediate" | "advanced")}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-all duration-200 cursor-pointer appearance-none"
                  required
                  disabled={isLoading}
                >
                  <option value="beginner">Básico</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="totalHours" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                  <Clock className="w-4 h-4 mr-2" />
                  Total de horas
                </label>
                <input
                  type="number"
                  id="totalHours"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-all duration-200"
                  min="0"
                  disabled={isLoading}
                  placeholder="Ej: 120"
                />
              </div>

              <div className="group">
                <label htmlFor="defaultPrice" className="flex items-center text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Precio por defecto (COP)
                </label>
                <input
                  type="number"
                  id="defaultPrice"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             transition-all duration-200"
                  min="0"
                  step="1000"
                  disabled={isLoading}
                  placeholder="Ej: 2000000"
                />
              </div>
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
                {isLoading ? "Creando..." : "Crear Programa"}
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
