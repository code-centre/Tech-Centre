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
          <h2 className="text-3xl font-bold ">Temario</h2>
          {
            course.pdf &&
            <a
              href={course.pdf}
              download
              className="border flex py-1 gap-1 items-center px-4 border-[#00A1F9] uppercase text-sm hover:bg-[#00A1F9] font-semibold hover:text-white rounded-full"
            >
              Descargar <DownloadIcon />{" "}
            </a>
          }
        </div>
        <div className={`flex flex-col gap-2`}>

          {syllabus?.map((item: any, i: number) => (
            <details key={i} className="group border-b pb-4">
              <summary className="flex justify-between items-center font-medium text-lg cursor-pointer list-none">
                {
                  editingModuleIndex === i
                    ? <input onChange={(e) => setSyllabus(prevOptions => {
                      const newOptions = [...prevOptions];
                      newOptions[i].module = e.target.value;
                      return newOptions;
                    })} className="border font-semibold px-2 py-1 rounded-md w-full" defaultValue={item.module} />
                    : <div className='flex gap-2 items-center'>
                      <h3 className='text-xl'>{item.module}</h3>
                    </div>
                }
                <div className="flex gap-2 items-center">
                  <span className="group-open:rotate-180 transition">
                    <ArrowDown />
                  </span>
                  {user?.rol === "admin" && (
                    <ButtonToEdit startEditing={() => setEditingModuleIndex(i)} />
                  )}
                </div>
              </summary>
              <ul className="list-disc marker:text-[#00A1F9] pl-5 flex flex-col gap-2 mt-2">
                {item.topics.map((topic: string, j: number) => (
                  <div key={j} className="flex items-center gap-2">
                    {editingModuleIndex === i ? (
                      <input
                        onChange={(e) => setSyllabus(prevOptions => {
                          const newOptions = [...prevOptions];
                          newOptions[i].topics[j] = e.target.value;
                          return newOptions;
                        })}
                        className="border font-semibold px-2 py-1 rounded-md w-full"
                        defaultValue={topic}
                        type="text"
                      />
                    ) : (
                      <li>{topic}</li>
                    )}
                  </div>
                ))}
              </ul>
              {editingModuleIndex === i &&
                <div className='flex flex-col gap-3 mt-2'>
                  <button onClick={() => addTopicModule(i)} className="bg-blueApp mt-2 px-2 text-center cursor-pointer text-white py-2 rounded-md block hover:bg-sky-600">Agregar tema</button>
                  <ContainerButtonsEdit
                    onSave={() => {
                      setEditingModuleIndex(false);

                      const updatedTopics = item.topics.map((t: string, index: number) =>
                        editedTopics[index] !== undefined ? editedTopics[index] : t
                      );

                      saveChanges('syllabus', syllabus);
                    }}
                    setFinishEdit={setEditingModuleIndex} />

                </div>
              }
            </details>
          ))
          }
        </div>
        {user?.rol === 'admin' &&
          <button onClick={addModules} className='bg-blueApp px-5 font-semibold rounded-md mx-auto mt-3 py-1 text-white w-fit'>Agregar</button>
        }
        {/* 
          {course?.syllabus?.map((item: any, i: number) => (
            <div key={i} className="mt-5">
              {editingModuleIndex === i ? (
                <div className="flex flex-col gap-2">
                  <input
                    className="border rounded-md p-3 font-bold"
                    type="text"
                    defaultValue={item.module}
                  />
                  <Editor
                    value={item.topics.join('<br/>')}
                    onChange={(content: string) => null}
                    onSave={() => {
                      setEditingModuleIndex(null); 
                    }}
                    onCancel={() => {
                      setEditingModuleIndex(null);
                    }}
                  />
                </div>
              ) : (
                <details className="group border-b pb-4">
                  <summary className="flex justify-between items-center font-medium text-lg cursor-pointer list-none">
                    {
                      updateModuleTitle
                        ? <input className="border font-semibold px-2 py-1 rounded-md " defaultValue={item.module} />
                        : <div className='flex gap-2 items-center'>
                          <h3>{item.module}</h3>
                          {user?.rol === "admin" && (
                            <ButtonToEdit startEditing={setUpdateModuleTitle} />
                          )}
                        </div>
                    }
                    <div className="flex gap-2 items-center">
                      <span className="group-open:rotate-180 transition">
                        <ArrowDown />
                      </span>
                      {user?.rol === "admin" && (
                        <ButtonToEdit startEditing={() => setEditingModuleIndex(i)} />
                      )}
                    </div>
                  </summary>
                  <ul className="list-disc marker:text-[#00A1F9] pl-5 flex flex-col gap-2 mt-2">
                    {item.topics.map((topic: any, j: number) => (
                      <li key={j}>{topic}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
            */}


      </div>
    </Wrapper>
  )
}
