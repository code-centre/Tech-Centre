'use client'
import React, { useState } from 'react'
import { InfoIcon, XIcon } from '../Icons'
import { SubmitHandler, useForm } from 'react-hook-form'
import Swal from 'sweetalert2'

interface Props {
  setOpenModal: any
}

interface IFormInput {
  name: string,
  age: string,
  program: string,
  address: string,
  neighborhood: string,
  phone: string,
  identification: string
  email: string,
  terms: boolean
}

export default function FormInfo({ setOpenModal }: Props) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, dirtyFields
    },
  } = useForm();

  const input = 'border px-2 py-1 rounded-md'
  const label = 'md:w-1/2 flex flex-col gap-1'
  const containerInput = 'flex flex-col md:flex-row justify-between gap-4'

  const onSubmit = async (data: any) => {

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('age', data.age);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('program', data.program);

    try {
      const data = await fetch('https://hook.us1.make.com/rjsks8m2bylehgyq4qvg1xypuz3a341h', {
        method: 'POST',
        body: formData,
        // headers: {
        //   "Content-Type": "multipart/form-data",
        //   // 'Accept': 'multipart/form-data' 
        // }
      })
      console.log(data);

      if (data.status == 200) {
        Swal.fire({
          title: 'Enviado',
          text: 'Tus datos han sido enviados',
          icon: 'success',
          confirmButtonText: 'Confirmar'
        }).then((result) => {
          if (result.isConfirmed) {
            setOpenModal(false)
          }
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="absolute inset-0 bg-black/70 z-20 flex justify-center items-center px-4">
      <form onSubmit={handleSubmit(onSubmit)
      } className="bg-white p-7 pt-10 rounded-md flex flex-col gap-5 relative">
        <button onClick={() => setOpenModal(false)} className='self-end absolute top-3 right-5 bg-black text-white w-fit rounded-full'><XIcon /></button>
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Indícanos tus datos de contacto</h2>
            <div className="border border-dashed"></div>
            <div className="flex flex-col gap-3  mt-1">
              <div className={containerInput}>
                <label htmlFor="" className={label}>
                  Nombre completo:
                  <input {...register("name", { required: true })} type="text" className={input} />
                </label>
                <label htmlFor="" className={label}>
                  Edad:
                  <input {...register("age", { required: true })} type="number" className={input} />
                </label>
              </div>
              <div className={containerInput}>
                <label className={label} htmlFor="">
                  Correo electrónico:
                  <input {...register("email", { required: true,  })} type="email" className={input} />
                </label>
                <label className={label} htmlFor="">
                  Teléfono de contacto:
                  <input {...register("phone", { required: true })} type="number" className={input} />
                </label>
              </div>

            </div>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Programa académico</h2>
            <div className="border border-dashed"></div>
            <label htmlFor="" className="flex flex-col gap-1">
              Programa académico:
              <select {...register("program", { required: true })} className="border w-full flex-1 px-2 py-1 rounded-md" name="program"
                id="program">
                <option value="">Selecciona...</option>
                <option value="Diplomado en Desarrollo de web con Énfasis en IA">Diplomado en Desarrollo de web con Énfasis en IA </option>
                <option value="Diplomado en Diseño Web UX-UI">Diplomado en Diseño Web UX-UI</option>
                <option value="Diplomado en Cloud Computing orientado en GCP">Diplomado en Cloud Computing orientado en GCP</option>
                <option value="Diplomado en modelado 3D - Blender">Diplomado en modelado 3D - Blender</option>
                <option value="Curso de corto IA desde cero">Curso de corto IA desde cero</option>
                <option value="Curso de IA para creativos">Curso de IA para creativos</option>
              </select>
            </label>
          </section>
        </div>

        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold">Declaración de consentimiento</h2>
          <div className="border border-dashed"></div>
          <div className="flex gap-3">
            <input {...register("terms", { required: true })} type="checkbox" name="terms"
              id="terms" />
            <span className="text-xs text-gray-400 md:w-[70%]">Declaro que la información proporcionada es verídica y autorizo el uso de mis datos personales conforme a las políticas de privacidad de FCA.
            </span>
          </div>
        </section>
        <button disabled={!isValid} type="submit" className="bg-black py-2 rounded-xl text-white uppercase hover:bg-black/60 disabled:bg-gray-400">Enviar</button>
        <p className='flex text-sm items-center gap-2 mt-4 text-blue-400'><InfoIcon className='w-11 lg:w-auto lg:h-auto' /> Uno de nuestros asesores académicos se comunicará contigo en la mayor brevedad posible.</p>
      </form>
    </div>
  )
}
