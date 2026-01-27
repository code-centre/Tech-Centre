'use client'
import { ArrowDown, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import ButtonToEdit from '@/components/ButtonToEdit';
import ContainerButtonsEdit from '@/components/ContainerButtonsEdit';
import { SyllabusData, Module } from '@/types/programs';
import { useSupabaseClient, useUser } from '@/lib/supabase';

interface Props {
  syllabusData: SyllabusData;
  programId: number;
  onSyllabusUpdate?: (updatedSyllabus: SyllabusData) => void;
}

export default function ProgramSyllabus({ syllabusData, programId, onSyllabusUpdate }: Props) {
  const supabase = useSupabaseClient()
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  
  const [syllabus, setSyllabus] = useState<Module[]>(syllabusData.modules || []);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  const [editedSyllabus, setEditedSyllabus] = useState<Module[]>(syllabus);
  const [isSaving, setIsSaving] = useState(false);

  const handleModuleTitleChange = (index: number, newTitle: string) => {
    const updated = [...editedSyllabus];
    updated[index] = { ...updated[index], title: newTitle };
    setEditedSyllabus(updated);
  };

  const handleTopicChange = (moduleIndex: number, topicIndex: number, newTopic: string) => {
    const updated = [...editedSyllabus];
    updated[moduleIndex].topics[topicIndex] = newTopic;
    setEditedSyllabus(updated);
  };

  const handleAddTopic = (moduleIndex: number) => {
    const updated = [...editedSyllabus];
    updated[moduleIndex].topics.push('');
    setEditedSyllabus(updated);
  };

  const handleRemoveTopic = (moduleIndex: number, topicIndex: number) => {
    const updated = [...editedSyllabus];
    updated[moduleIndex].topics = updated[moduleIndex].topics.filter((_, i) => i !== topicIndex);
    setEditedSyllabus(updated);
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    
    setIsSaving(true);
    try {
      // Filtrar temas vacíos
      const cleanedSyllabus = editedSyllabus.map(module => ({
        ...module,
        topics: module.topics.filter(topic => topic.trim() !== '')
      }));

      // Actualizar en Supabase
      const { error } = await supabase
        .from('programs')
        .update({
          syllabus: { modules: cleanedSyllabus },
          updated_at: new Date().toISOString()
        })
        .eq('id', programId);

      if (error) {
        console.error('Error al guardar el syllabus:', error);
        alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
        return;
      }

      // Actualizar estado local
      setSyllabus(cleanedSyllabus);
      setEditingModuleIndex(null);
      
      // Notificar al componente padre si existe el callback
      if (onSyllabusUpdate) {
        onSyllabusUpdate({ modules: cleanedSyllabus });
      }

      console.log('Syllabus actualizado correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedSyllabus(syllabus);
    setEditingModuleIndex(null);
  };

  const handleStartEdit = (index: number) => {
    setEditedSyllabus([...syllabus]);
    setEditingModuleIndex(index);
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blueApp">Temario</h2>
      </div>

      <div className="flex flex-col gap-6">
        {editedSyllabus?.map((module, i) => (
          <details key={module.id} className="group border-b border-gray-700 pb-4">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
              {editingModuleIndex === i ? (
                <div className="w-full flex flex-col gap-2">
                  <input
                    value={module.title}
                    onChange={(e) => handleModuleTitleChange(i, e.target.value)}
                    className="border border-gray-600 px-3 py-2 rounded-md w-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blueApp"
                    placeholder="Título del módulo"
                  />
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <h3 className="text-xl text-white">
                    {i + 1}. {module.title} 
                  </h3>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <span className="group-open:rotate-180 transition-transform duration-300 text-blue-400">
                  <ArrowDown />
                </span>
                {isAdmin && editingModuleIndex !== i && (
                  <ButtonToEdit 
                    startEditing={() => handleStartEdit(i)} 
                  />
                )}
              </div>
            </summary>

            <ul className="list-disc marker:text-blue-400 pl-6 mt-4 space-y-2">
              {editedSyllabus[i].topics.map((topic, j) => (
                <li key={j} className="text-gray-200">
                  {editingModuleIndex === i ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={topic}
                        onChange={(e) => handleTopicChange(i, j, e.target.value)}
                        className="border border-gray-600 px-2 py-1 rounded-md flex-1 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blueApp"
                        placeholder="Nuevo tema"
                      />
                      <button
                        onClick={() => handleRemoveTopic(i, j)}
                        className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    topic
                  )}
                </li>
              ))}
              {editingModuleIndex === i && (
                <li>
                  <button
                    onClick={() => handleAddTopic(i)}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    type="button"
                  >
                    + Agregar tema
                  </button>
                </li>
              )}
            </ul>

            {editingModuleIndex === i && (
              <div className="mt-4">
                <ContainerButtonsEdit
                  onSave={handleSave}
                  setFinishEdit={handleCancel}
                />
                {isSaving && (
                  <span className="ml-4 text-gray-400 text-sm">Guardando...</span>
                )}
              </div>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}