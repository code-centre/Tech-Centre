import useUserStore from '../../../store/useUserStore';
import React, { useState, useEffect } from 'react';
import ContainerButtonsEdit from '../course/ContainerButtonsEdit';
import ButtonToEdit from '../course/ButtonToEdit';
import Image from 'next/image';

interface Props {
  shortCourse: EventFCA;
  saveChanges: (propertyName: string, content: any, index?: number) => void;
  type?: string; 
}

export default function Benefits({ shortCourse, saveChanges, type = "curso" }: Props) {
  const { user } = useUserStore();
  const [updateBenefits, setUpdateBenefits] = useState(false);
  const [benefits, setBenefits] = useState<string[]>(shortCourse.benefits || []);
  const [editingBenefitIndex, setEditingBenefitIndex] = useState<number | null>(null);

  useEffect(() => {
    if (shortCourse?.benefits) {
      setBenefits(shortCourse.benefits);
    }
  }, [shortCourse?.benefits]);

  const addNewBenefit = () => {
    setBenefits(prev => [...prev, ""]);
    setEditingBenefitIndex(benefits.length); // Empieza a editar el nuevo beneficio
  };

  return (
    <section className="min-h-[50vh]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-10 py-5 items-center px-4">
        <div className="flex flex-col gap-6 lg:gap-10">
          <h2 className="text-2xl lg:text-2xl font-bold text-blueApp text-balance">
            ¿Cuáles son los beneficios de tomar <span className="text-white">este {type}?</span>
          </h2>
          <p className="text-lg font-semibold text-white">
            Somos pioneros en inteligencia artificial y tecnologías de vanguardia en la Costa.
          </p>
          <ul className="list-disc marker:text-[#00A1F9] pl-8 flex flex-col gap-5">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-white">
                {editingBenefitIndex === i ? (
                  <div className="flex flex-col gap-2 w-full">
                    <textarea
                      value={benefits[i]}
                      onChange={e => {
                        const newBenefits = [...benefits];
                        newBenefits[i] = e.target.value;
                        setBenefits(newBenefits);
                      }}
                      className="border p-2 w-full"
                    />
                    <ContainerButtonsEdit
                      setFinishEdit={() => setEditingBenefitIndex(null)}
                      onSave={() => {
                        saveChanges('benefits', benefits);
                        setEditingBenefitIndex(null);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className='bg-blueApp rounded-full w-3 h-3 flex-shrink-0'></div>
                    <span>{benefit}</span>
                    {user?.rol === 'admin' && (
                      <ButtonToEdit startEditing={() => setEditingBenefitIndex(i)} />
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
          {user?.rol === 'admin' && (
            <button
              onClick={addNewBenefit}
              className="bg-blueApp px-5 font-semibold rounded-md mx-auto py-1 text-white w-fit"
            >
              Agregar
            </button>
          )}
        </div>
        {/* <Image width={405} height={520} className="hidden lg:block mask" src="/image-benefits.png" alt="" /> */}
      </div>
    </section>
  );
}
