import React from 'react'

interface Props {
  title: string
  description: string
  background: string
  textBlack?: boolean
}

export default function BenefitCard({ title, description, background, textBlack = false }: Props) {
  return (
    <section className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row text-center">
      {/* <div className={`lg:w-[35%] lg:h-[350px] h-[250px] bg-gray-500 `}></div> */}
      <div style={{ color: textBlack ? 'black' : 'white', backgroundColor: background }} className={`lg:w-[100%] lg:h-[350px] h-[400px] text-white lg:p-10 p-5 flex flex-col gap-3 justify-center`}>
        <p className="text-xl">¿Para quien esta dirigido este curso?</p>
        <p className="text-3xl md:text-4xl font-bold uppercase">{title}</p>
        <p className="text-xl font-light">{description}</p>
      </div>
    </section>
  )
}
