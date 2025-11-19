import Wrapper from '../Wrapper';
import useUserStore from '../../../store/useUserStore';
import React, { useState, useEffect } from 'react'
import ContainerButtonsEdit from '../course/ContainerButtonsEdit';
import { ArrowDown } from 'lucide-react';
import ButtonToEdit from '../course/ButtonToEdit';

interface FaqItem {
  id: number;
  pregunta: string;  // Changed from 'question'
  respuesta: string; // Changed from 'answer'
}

interface Props {
  shortCourse: {
    faqs?: FaqItem[];
  } | FaqItem[];  // Acepta tanto el objeto con faqs como un array directo
}

export default function FaqsSupa({ shortCourse = { faqs: [] } }: Props) {
  const { user } = useUserStore();
  const [editingFAQIndex, setEditingFAQIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [contentQuestion, setContentQuestion] = useState('')
  const [contentAnswer, setContentAnswer] = useState('')

  useEffect(() => {
    if (Array.isArray(shortCourse)) {
      // Si shortCourse es un array, usarlo directamente
      setFaqs(shortCourse);
    } else if (shortCourse?.faqs && Array.isArray(shortCourse.faqs)) {
      // Si shortCourse es un objeto con propiedad faqs
      setFaqs(shortCourse.faqs);
    } else {
      // Si no hay datos o el formato no es el esperado
      setFaqs([]);
    }
  }, [shortCourse]);
  

    return (
      <Wrapper styles="flex flex-col gap-2 w-full max-w-6xl mx-auto">
        {/* {shortCourse.faqs.length > 0 && ( */}
          <>
            <h2 className="text-3xl font-bold text-white mb-6">Preguntas Frecuentes</h2>
            {faqs.map((item: any, i: number) => (
              <div key={i} className="mt-5 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                {editingFAQIndex === i ? (
                  <div className="flex flex-col gap-4 bg-gray-50/50 p-4 rounded-lg border border-grayApp">
                    <input
                      className="w-full px-4 py-3 font-medium text-gray-800 bg-white border border-grayApp rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blueApp/20 focus:border-blueApp
                      transition-all duration-200"
                      type="text"
                      placeholder="Escribe la pregunta..."
                      defaultValue={item.pregunta}
                      // onChange={(e) => setFaqs(prevOptions => {
                      //   const newOptions = [...prevOptions];
                      //   newOptions[i].question = e.target.value;
                      //   return newOptions;
                      // })}
                    />
                    <textarea
                      className="w-full px-4 py-3 text-gray-700 bg-white border border-grayApp rounded-lg min-h-[100px]
                      focus:outline-none focus:ring-2 focus:ring-blueApp/20 focus:border-blueApp
                      transition-all duration-200 resize-y"
                      placeholder="Escribe la respuesta..."
                      defaultValue={item.respuesta}
                      // onChange={(e) => setFaqs(prevOptions => {
                      //   const newOptions = [...prevOptions];
                      //   newOptions[i].answer = e.target.value;
                      //   return newOptions;
                      // })}
                    />
                    {/* <ContainerButtonsEdit
                      setFinishEdit={setEditingFAQIndex}
                      onSave={() => {
                        saveChanges('faqs', faqs);
                        setEditingFAQIndex(null)
                      }}
                    /> */}
                  </div>
                ) : (
                  <details className="group border-b border-grayApp pb-4">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-2">
                      <h3 className="text-xl text-white font-semibold pr-8">
                        {i+1}.{item.pregunta}
                      </h3>
                      <div className="flex gap-2 items-center">
                        <span className="text-blueApp transform group-open:rotate-180 transition-transform duration-300">
                          <ArrowDown />
                        </span>
                        {user?.rol === "admin" && (
                          <ButtonToEdit startEditing={() => setEditingFAQIndex(i)} />
                        )}
                      </div>
                    </summary>
                    <div className="mt-4 text-white leading-relaxed pl-1">
                      {item.respuesta}
                    </div>
                  </details>
                )}
              </div>
            ))}
            {user?.rol === 'admin' && (
              <button
                // onClick={addNewFaq}
                className="bg-blueApp hover:bg-darkBlue text-white px-6 py-2 rounded-lg 
                font-semibold mx-auto mt-6 w-fit transform transition-all duration-300
                hover:shadow-md active:scale-95"
              >
                Agregar pregunta
              </button>
            )}
          </>
        {/* )} */}
      </Wrapper>
    );
  }
