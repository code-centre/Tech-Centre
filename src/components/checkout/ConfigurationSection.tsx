'use client'
import { Minus, Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import SelectSchedule from './SelectSchedule'
import SelectPayment from './SelectPayment'

interface Props {
  data: Program | any
  slugProgram: string | null
  ticket: Ticket | null
  subtotal: number | null
  quantity: number
  paymentMethod: string | null
  selectedSchedule: string | null
  setSelectedSchedule: (value: null | string) => void
  setPaymentMethod: (value: null | string) => void
  setSubtotal: (value: null | number) => void
  setQuantity: (value: number) => void
  setShowQuantity: (value: boolean) => void
  showQuantity: boolean
}

export default function ConfigurationSection({ slugProgram, data, subtotal, setSubtotal, ticket, setQuantity, quantity, setPaymentMethod, paymentMethod, selectedSchedule, setSelectedSchedule, setShowQuantity, showQuantity }: Props) {
  const [priceSelected, setPriceSelected] = useState<number>(data.discount ? data.discount : data.price)

  const styleButton = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blueApp disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 hover:border-blueApp'

  const styleInput = 'flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blueApp w-22 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'


  return (
    <div className='w-full text-white flex flex-col gap-5 pt-24 pb-14 px-6 md:px-20 lg:px-14'>
      <h2 className='text-4xl font-bold'>Confirmación de compra</h2>
      <div className='border-b h-1'></div>
      {
        slugProgram &&
        <p className='text-base'>Selecciona el horario y el metodo de pago para finalizar la compra.</p>
      }
      {
        slugProgram &&
        <SelectSchedule
          data={data}
          selectedSchedule={selectedSchedule}
          setSelectedSchedule={setSelectedSchedule}
        />
      }
      {
        slugProgram &&
        <>
          {
            // selectedSchedule &&
            <SelectPayment
              data={data}
              paymentMethod={paymentMethod}
              priceSelected={data.type === 'curso especializado' ? data.tickets[0].price : priceSelected}
              isShort={data.type === 'curso especializado'}
              setPaymentMethod={setPaymentMethod}
              setPriceSelected={setPriceSelected}
              setQuantity={setQuantity}
              setSubtotal={setSubtotal}
            />
          }
        </>
      }
      {
        !slugProgram &&
        <>
          <p className='font-semibold'>Beneficios de este evento</p>
          <ul className='list-disc pl-4 -mt-2 disc marker:text-blueApp'>
            {
              ticket && ticket.benefits.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))
            }
          </ul>
        </>
      }
      {
        showQuantity &&
        <>
          <h2 className='text-4xl font-bold mt-4'>Cantidad</h2>
          <div className='h-1 border-b'></div>
          {/* <p className='text-sm'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis nemo reiciendis aliquam sapiente. Adipisci repudiandae corrupti fugit impedit vel? Fugit ipsum cupiditate veniam aperiam rerum sit molestias ratione facere at.</p> */}

          <div className="grid grid-cols-[auto_1fr_auto] lg:flex lg:flex-row gap-1  m-0">
            <button
              disabled={quantity === 1}
              className={`${styleButton} disabled:cursor-not-allowed`}
              onClick={() => {
                setQuantity(quantity - 1)
              }}
            >
              <Minus className="h-4 w-4 " />
            </button>
            <input
              type="number"
              value={quantity}
              defaultValue={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className={`${styleInput} w-full`}
            />
            <button
              disabled={!subtotal}
              className={`${styleButton} disabled:cursor-not-allowed`}
              onClick={() => {
                setQuantity(quantity + 1)
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </>

      }
    </div>
  )
}
