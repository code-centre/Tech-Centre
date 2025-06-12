import Editor from '@/components/Editor';
import { ArrowDown, DownloadIcon } from '../../Icons';
// import Wrapper from '@/components/Wrapper';
import Wrapper from '../../Wrapper';
import useUserStore from '../../../../store/useUserStore';
import React, { useState } from 'react'
import ButtonToEdit from '../ButtonToEdit';
import ContainerButtonsEdit from '../ContainerButtonsEdit';

interface Props {
  course: Program,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function Syllabus({ course, saveChanges }: Props) {
  const { user } = useUserStore()
  const [updateSyllabus, setUpdateSyllabus] = useState(false)
  const [updateModuleTitle, setUpdateModuleTitle] = useState(false)
  const [syllabus, setSyllabus] = useState(course.syllabus)
  const [contentModuleTitle, setContentModuleTitle] = useState<string>('')
  const [contentModuleTopic, setContentModuleTopic] = useState<string>('')
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null | boolean>(null);
  const [updateModuleTopic, setUpdateModuleTopic] = useState(false)
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null | boolean>(null);
  const [editedTopics, setEditedTopics] = useState<Record<number, string>>({});

  const addModules = () => {
    setSyllabus([...syllabus, { module: "", topics: [""] }]);
  };

  const addTopicModule = (index: number) => {
    const newSyllabus = [...syllabus]
    const syllabusToUpdate = newSyllabus[index].topics.push('')
    setSyllabus(newSyllabus);

  };


  return (
    <Wrapper styles="w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Temario</h2>
          {course.pdf && (
            <a
              href={course.pdf}
              download
              className="border border-blueApp text-blueApp hover:bg-blueApp hover:text-white
                transition-colors duration-300 flex items-center gap-1 px-4 py-1
                rounded-full uppercase text-sm font-semibold"
            >
              Descargar <DownloadIcon />
            </a>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {syllabus?.map((item: any, i: number) => (
            <details key={i} className="group border-b border-grayApp pb-4">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                {editingModuleIndex === i ? (
                  <input 
                    onChange={(e) => setSyllabus(prevOptions => {
                      const newOptions = [...prevOptions];
                      newOptions[i].module = e.target.value;
                      return newOptions;
                    })} 
                    className="border border-grayApp px-2 py-1 rounded-md w-full
                      focus:border-blueApp focus:ring-2 focus:ring-blueApp/20
                      transition-all duration-200"
                    defaultValue={item.module} 
                  />
                ) : (
                  <div className="flex gap-2 items-center">
                    <h3 className="text-xl text-gray-800">{item.module}</h3>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <span className="group-open:rotate-180 transition-transform duration-300 text-blueApp">
                    <ArrowDown />
                  </span>
                  {user?.rol === "admin" && (
                    <ButtonToEdit startEditing={() => setEditingModuleIndex(i)} />
                  )}
                </div>
              </summary>

              <ul className="list-disc marker:text-blueApp pl-5 flex flex-col gap-2 mt-2">
                {item.topics.map((topic: string, j: number) => (
                  <div key={j} className="flex items-center gap-2">
                    {editingModuleIndex === i ? (
                      <input
                        onChange={(e) => setSyllabus(prevOptions => {
                          const newOptions = [...prevOptions];
                          newOptions[i].topics[j] = e.target.value;
                          return newOptions;
                        })}
                        className="border border-grayApp px-2 py-1 rounded-md w-full
                          focus:border-blueApp focus:ring-2 focus:ring-blueApp/20
                          transition-all duration-200"
                        defaultValue={topic}
                        type="text"
                      />
                    ) : (
                      <li className="text-gray-700">{topic}</li>
                    )}
                  </div>
                ))}
              </ul>

              {editingModuleIndex === i && (
                <div className="flex flex-col gap-3 mt-2">
                  <button 
                    onClick={() => addTopicModule(i)} 
                    className="bg-blueApp text-white px-2 py-2 rounded-md 
                      hover:bg-darkBlue transition-colors duration-300"
                  >
                    Agregar tema
                  </button>
                  <ContainerButtonsEdit
                    onSave={() => {
                      setEditingModuleIndex(false);
                      const updatedTopics = item.topics.map((t: string, index: number) =>
                        editedTopics[index] !== undefined ? editedTopics[index] : t
                      );
                      saveChanges('syllabus', syllabus);
                    }}
                    setFinishEdit={setEditingModuleIndex}
                  />
                </div>
              )}
            </details>
          ))}
        </div>

        {user?.rol === 'admin' && (
          <button 
            onClick={addModules} 
            className="bg-blueApp text-white px-5 py-1.5 rounded-md mx-auto mt-3
              hover:bg-darkBlue transition-colors duration-300 font-semibold w-fit"
          >
            Agregar
          </button>
        )}
      </div>
    </Wrapper>
  );
}
