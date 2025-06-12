import useUserStore from '../../../../store/useUserStore';
import React, { useState } from 'react'
import ContainerButtonsEdit from '../ContainerButtonsEdit';
import ButtonToEdit from '../ButtonToEdit';
import Image from 'next/image';

interface Props {
  course: Program
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function Benefits({ course, saveChanges }: Props) {
  const { user } = useUserStore()
  const [updateBenefits, setUpdateBenefits] = useState(false)
  const [benefits, setBenefits] = useState(course.benefits)
  const [content, setContent] = useState("");
  const [editingBenefitIndex, setEditingBenefitIndex] = useState<number | null | boolean>(null);
  const addOptionBenefits = () => {
    setBenefits([...benefits, ""]);
  };

  return (
    <section className="min-h-[50vh]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-10 py-5 items-center px-4">
        <div className="flex flex-col gap-6 lg:gap-10">
          <h2 className="text-3xl lg:text-5xl font-bold text-blue-500 text-balance">¿Cuales son los beneficios de tomar <span className="text-black">este diplomado?</span></h2>
          <p className="text-lg font-semibold">Somos pioneros en inteligencia artificial y
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
                    : <div className="flex items-center gap-2" key={benefit}>
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
            <button onClick={addOptionBenefits} className='bg-blueApp px-5 font-semibold rounded-md mx-auto py-1 text-white w-fit'>Agregar</button>
          }
        </div>
        {/* <img className="hidden lg:block mask" src="/image-benefits.png" alt="" /> */}
        {/* <Image width={405} height={520} className="hidden lg:block mask" src="/image-benefits.png" alt="" /> */}
      </div>
    </section>
  )
}
