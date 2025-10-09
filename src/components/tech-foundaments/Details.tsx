'use client'
import React, { useState, useEffect } from 'react'
import { Book, ListChecks, Check, LightbulbIcon, EditIcon, Code, BrainCircuit, Loader2 } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import useUserStore from '../../../store/useUserStore'
import Editor from '../Editor'

interface Props {
  shortCourse: EventFCA,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function Details({ shortCourse, saveChanges }: Props) {
  const [isEditing, setIsEditing] = useState(false);  const [content, setContent] = useState(shortCourse?.details || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasDetails, setHasDetails] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    if (shortCourse?.details && shortCourse.details.trim() !== '') {
      setHasDetails(true);
    } else {
      setHasDetails(false);
    }
  }, [shortCourse?.details]);

  const isAdmin = user?.rol === 'admin';

  return (
    <div className="max-w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
      {/* Header with gradient */}
      <div className="p-4 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <BrainCircuit className="text-blueApp" size={24} />
          ¿Qué aprenderás?
        </h2>
        {isAdmin && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blueApp hover:bg-blue-600 transition-colors p-2 rounded-full"
          >
            <EditIcon className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="px-6">
        {isEditing ? (
          <div className="space-y-4">
            <Editor
              value={shortCourse?.details || ''}
              onChange={(content) => setContent(content)}              onSave={() => {
                saveChanges('details', content);
                setIsEditing(false);
                if (content && content.trim() !== '') {
                  setHasDetails(true);
                }
              }}
              onCancel={() => setIsEditing(false)}
            />
            {error && (
              <div className="p-2 bg-red-900/50 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        ) : isSaving ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-blue-500">Guardando cambios...</span>
          </div>
        ) : hasDetails ? (
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed prose-headings:text-blueApp prose-a:text-blue-400">
              {HTMLReactParser(shortCourse?.details || '')}
            </div>
            {error && (
              <div className="p-2 mt-4 bg-red-900/50 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <ListChecks className="h-12 w-12 text-zinc-500" />
              <p className="text-zinc-400 text-lg">
                Aún no hay información detallada sobre el contenido del curso.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Añadir contenido
                </button>
              )}
            </div>
          </div>
        )}

        {/* Beneficios adicionales */}
        {hasDetails && (
          <div className="my-4 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <LightbulbIcon size={18} className="text-blueApp" />
              Beneficios adicionales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-zinc-800 rounded-full p-1">
                  <Check size={16} className="text-green-400" />
                </div>
                <p className="text-gray-300 text-sm">Materiales y recursos de aprendizaje incluidos</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-zinc-800 rounded-full p-1">
                  <Check size={16} className="text-green-400" />
                </div>
                <p className="text-gray-300 text-sm">Acceso a comunidad de aprendizaje</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-zinc-800 rounded-full p-1">
                  <Check size={16} className="text-green-400" />
                </div>
                <p className="text-gray-300 text-sm">Certificado de participación</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-zinc-800 rounded-full p-1">
                  <Check size={16} className="text-green-400" />
                </div>
                <p className="text-gray-300 text-sm">Asesoría personalizada durante el curso</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
