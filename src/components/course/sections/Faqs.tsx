import Wrapper from '../../Wrapper';
import useUserStore from '../../../../store/useUserStore';
import React, { useState } from 'react'
import ContainerButtonsEdit from '../ContainerButtonsEdit';
import { ArrowDown } from '../../../components/Icons';
import ButtonToEdit from '../ButtonToEdit';

interface Props {
  course: Program,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function Faqs({ course, saveChanges }: Props) {
  const { user } = useUserStore()
  const [updateFaqs, setUpdateFaqs] = useState(false)
  const [editingFAQIndex, setEditingFAQIndex] = useState<number | null | boolean>(null);
  const [faqs, setFaqs] = useState(course.faqs)
  const [contentQuestion, setContentQuestion] = useState('')
  const [contentAnswer, setContentAnswer] = useState('')

  const addFaqs = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  return (
    <Wrapper styles="flex flex-col gap-2 w-full max-w-6xl mx-auto">
      {
        course.faqs.length > 0 &&
        <>
          <h2 className="text-2xl font-bold">FAQs</h2>
          {faqs.map((item: any, i: number) => (
            <div key={i} className="mt-5">
              {
                editingFAQIndex === i
                  ?
                  <div className="flex flex-col gap-2">
                    <input
                      className="border rounded-md p-3 font-bold"
                      type="text"
                      defaultValue={item.question}
                      onChange={(e) => setFaqs(prevOptions => {
                        const newOptions = [...prevOptions];
                        newOptions[i].question = e.target.value;
                        return newOptions;
                      })}
                    />
                    <textarea
                      className="border rounded-md p-3"
                      defaultValue={item.answer}
                      onChange={(e) => setFaqs(prevOptions => {
                        const newOptions = [...prevOptions];
                        newOptions[i].answer = e.target.value;
                        return newOptions;
                      })}
                    />
                    <ContainerButtonsEdit setFinishEdit={setEditingFAQIndex} onSave={() => { saveChanges('faqs', faqs); setEditingFAQIndex(null) }} />
                  </div>
                  : <details className="group border-b pb-4">
                    <summary className="flex justify-between items-center font-medium text-lg cursor-pointer list-none">
                      <h3 className='text-xl'>{item.question}</h3>
                      <div className="flex gap-2 items-center">
                        <span className="group-open:rotate-180 transition">
                          <ArrowDown />
                        </span>
                        {user?.rol === "admin" && (
                          <ButtonToEdit startEditing={() => setEditingFAQIndex(i)} />
                        )}
                      </div>
                    </summary>
                    <p>{item.answer}</p>
                  </details>
              }
            </div>
          ))}
          {user?.rol === 'admin' &&
            <button onClick={addFaqs} className='bg-blueApp px-5 font-semibold rounded-md mx-auto mt-3 py-1 text-white w-fit'>Agregar</button>
          }
        </>
      }
    </Wrapper>
  )
}
