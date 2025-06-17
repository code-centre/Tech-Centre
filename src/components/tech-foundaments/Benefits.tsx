import useUserStore from '../../../store/useUserStore';
import React, { use, useState, useEffect } from 'react'
import ContainerButtonsEdit from '../course/ContainerButtonsEdit';
import ButtonToEdit from '../course/ButtonToEdit';
import Image from 'next/image';

interface Props {
  shortCourse: EventFCA,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function Benefits({ shortCourse, saveChanges }: Props) {
  const { user } = useUserStore()
  const [updateBenefits, setUpdateBenefits] = useState(false)
  const [benefits, setBenefits] = useState(shortCourse.benefits || [])
  const [content, setContent] = useState("");
  const [editingBenefitIndex, setEditingBenefitIndex] = useState<number | null | boolean>(null);

  useEffect(() => {
    if (shortCourse?.benefits) {
      setBenefits(shortCourse.benefits);
    }
  }, [shortCourse?.benefits]);

  const addNewBenefit = () => {
    if (!benefits) {
      setBenefits([""]);
    } else {
      setBenefits([...benefits, ""]);
    }
  };

  return (
    <section className="min-h-[50vh]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-10 py-5 items-center px-4">
        <div className="flex flex-col gap-6 lg:gap-10">
          <h2 className="text-3xl lg:text-5xl font-bold text-blueApp text-balance">¿Cuales son los beneficios de tomar <span className="text-white">este diplomado?</span></h2>
          <p className="text-lg font-semibold text-white">Somos pioneros en inteligencia artificial y
            tecnologías de vanguardia en la Costa. </p>
          <ul className="list-disc marker:text-[#00A1F9]  pl-8 flex flex-col gap-5  ">
            {benefits.map((benefit: any, i: number) => (
              <>
                {
                  editingBenefitIndex === i
                    ? <div className="flex flex-col gap-2">
                      <textarea onChange={(e) => setBenefits(prevOptions => {
                        const newOptions = [...prevOptions];
                        newOptions[i] = e.target.value;
                        return newOptions;
                      })} defaultValue={benefit} className="border p-2"></textarea>
                      <ContainerButtonsEdit
                        setFinishEdit={setEditingBenefitIndex}
                        onSave={() => {
                          saveChanges('benefits', benefits)
                          setEditingBenefitIndex(null)
                        }} />
                    </div>
                    : <div className="flex items-center gap-2 text-white" key={benefit}>
                      <li key={i}>{benefit}</li>

                      {
                        user?.rol === 'admin' &&
                        <ButtonToEdit startEditing={() => setEditingBenefitIndex(i)} />
                      }
                    </div>
                }
              </>
            ))}
          </ul>
          {user?.rol === 'admin' &&
            <button onClick={addNewBenefit} className='bg-blueApp px-5 font-semibold rounded-md mx-auto py-1 text-white w-fit'>Agregar</button>
          }
        </div>
        {/* <img className="hidden lg:block mask" src="/image-benefits.png" alt="" /> */}
        {/* <Image width={405} height={520} className="hidden lg:block mask" src="/image-benefits.png" alt="" /> */}
      </div>
    </section>
  )
}
