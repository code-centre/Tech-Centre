import { ArrowDown, DownloadIcon } from 'lucide-react';
import Wrapper from '../Wrapper';
import React, { useState } from 'react';
import ButtonToEdit from '@/components/course/ButtonToEdit';
import ContainerButtonsEdit from '@/components/course/ContainerButtonsEdit';
import { Module, SyllabusData } from './programContainerDetails'; // Ajusta la ruta según sea necesario

interface Props {
  silabo: SyllabusData | null;
}

export default function SyllabusSupa({ silabo }: Props) {
  const [syllabus, setSyllabus] = useState<Module[]>(silabo?.modulos || []);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  return (
    <Wrapper styles="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex justify-center mb-6">
          <h2 className="text-2xl font-bold text-blueApp">Temario</h2>
          {/* {shortCourse.pdf && (
            <a
              href={shortCourse.pdf}
              download
              className="border border-blueApp text-blueApp hover:bg-blueApp hover:text-white
              transition-colors duration-300 flex items-center gap-1 px-4 py-1
              rounded-full uppercase text-sm font-semibold"
            >
              Descargar <DownloadIcon />
            </a>
          )} */}
        </div>

        <div className="flex flex-col gap-6">
          {syllabus?.map((modulo, i) => (
            <details key={modulo.id} className="group border-b border-gray-700 pb-4">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                {editingModuleIndex === i ? (
                  <div className="w-full flex flex-col gap-2">
                    <input
                      value={modulo.titulo}
                      className="border border-gray-600 px-3 py-2 rounded-md w-full bg-gray-800 text-white"
                      placeholder="Título del módulo"
                    />
                    <input
                      type="number"
                      value={modulo.duracion_horas}
                      className="border border-gray-600 px-3 py-1 rounded-md w-24 bg-gray-800 text-white"
                      placeholder="Horas"
                    />
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <h3 className="text-xl text-white">
                      {i + 1}. {modulo.titulo} 
                      <span className="ml-2 text-sm text-gray-400">
                        ({modulo.duracion_horas} horas)
                      </span>
                    </h3>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <span className="group-open:rotate-180 transition-transform duration-300 text-blue-400">
                    <ArrowDown />
                  </span>
                  {/* {user?.rol === "admin" && (
                    <ButtonToEdit 
                      startEditing={() => setEditingModuleIndex(i)} 
                    />
                  )} */}
                </div>
              </summary>

              <ul className="list-disc marker:text-blue-400 pl-8 mt-4 space-y-2">
                {syllabus[i].temas.map((tema, j) => (
                  <li key={j} className="text-gray-200">
                    {editingModuleIndex === i ? (
                      <input
                        value={tema}
                        className="border border-gray-600 px-2 py-1 rounded-md w-full bg-gray-800 text-white"
                        placeholder="Nuevo tema"
                      />
                    ) : (
                      tema
                    )}
                  </li>
                ))}
                {editingModuleIndex === i && (
                  <li>
                    <button
                      className="mt-2 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      + Agregar tema
                    </button>
                  </li>
                )}
              </ul>

              {editingModuleIndex === i && (
                <div className="mt-4">
                  <ContainerButtonsEdit
                    onSave={() => {
                      // Aquí puedes agregar la lógica para guardar en la base de datos
                      setEditingModuleIndex(null);
                    }}
                    setFinishEdit={() => setEditingModuleIndex(null)}
                  />
                </div>
              )}
            </details>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}