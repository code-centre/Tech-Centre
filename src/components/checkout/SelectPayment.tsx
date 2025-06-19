import { Plus, X } from 'lucide-react'
import React from 'react'

interface Props {
  data: Program | any
  paymentMethod: string | null
  setPaymentMethod: (value: string | null) => void
  setSubtotal: (value: number | null) => void
  setPriceSelected: (value: number) => void
  setQuantity: (value: number) => void
  priceSelected: number
  isShort?: boolean
}

export default function SelectPayment({ data, paymentMethod, setPaymentMethod, setSubtotal, setPriceSelected, priceSelected, setQuantity, isShort }: Props) {

  return (
    <section className='flex flex-col gap-5'>
      <h2 className='text-4xl font-bold mt-4'>Opciones de pago</h2>
      <div className='h-1 border-b'></div>
      <p className='font-semibold'>Financiación del curso</p>
      <p className=''>Queremos que formes parte de esta experiencia, por eso puedes elegir entre pagar el curso completo o dividirlo en 4 pagos, abonando solo la inscripción para comenzar.</p>
      {paymentMethod &&
        <p className='flex items-center gap-2'>
          Opción de pago seleccionado:
          <span className='text-blueApp font-semibold'>
            {paymentMethod === 'full' ? (
              `$${priceSelected?.toLocaleString()}`
            ) : (
              isShort ?
                `${(priceSelected / 2)?.toLocaleString()} COP` :
                `${(priceSelected)?.toLocaleString()} COP`
            )}
          </span>
          <button onClick={() => {
            setQuantity(1)
            setPaymentMethod(null)
            setSubtotal(null)
            setPriceSelected(data.discount ? data.discount : data.price)
          }} className='rounded-md border-2 border-red-500 hover:bg-red-500 transition-colors group'>
            <X className='text-red-500  w-4 h-4 group-hover:text-white transition-colors' />
          </button>
        </p>
      }

      {
        !paymentMethod &&
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <p className=''>
              <span className='text-blueApp font-semibold text-lg'>Pago completo | </span>
              ${priceSelected && priceSelected.toLocaleString()} COP
              {data.discount &&
                <span> {"("}Descuento {data.discount && (((data.price - data.discount) * 100 / data.price)).toFixed(0)}%{")"}</span>
              }
            </p>
            {isShort ?
              (
                <button onClick={() => {
                  setPaymentMethod('full')
                  setSubtotal(data.tickets[0].price)
                  setPriceSelected(data.tickets[0].price)
                }} className='border-2 border-blueApp hover:bg-blueApp group transition-colors rounded-md'>
                  <Plus className='text-blueApp w-5 h-5 group-hover:text-white transition-colors' />
                </button>
              ) : (
                <button onClick={() => {
                  setPaymentMethod('full')
                  setSubtotal(data.discount ? data.discount : data.price)
                  setPriceSelected(data.discount ? data.discount : data.price)
                }} className='border-2 border-blueApp hover:bg-blueApp group transition-colors rounded-md'>
                  <Plus className='text-blueApp w-5 h-5 group-hover:text-white transition-colors' />
                </button>
              )}

          </div>
          {isShort ? (
            <div className='flex items-center justify-between'>
              <p><span className='text-blueApp font-semibold text-lg'>Pago parcial | </span>2 cuotas de ${priceSelected && (priceSelected / 2).toLocaleString()} COP</p>
              <button onClick={() => {
                setPaymentMethod('monthly')
                setSubtotal(data?.tickets[0].price / 2)
                setPriceSelected(data?.tickets[0].price / 2)
              }} className='border-2 border-blueApp hover:bg-blueApp group transition-colors rounded-md'>
                <Plus className='text-blueApp w-5 h-5 group-hover:text-white transition-colors' />
              </button>
            </div>
          ) : (
            <div className='flex items-center justify-between'>
              <p><span className='text-blueApp font-semibold text-lg'>Pago parcial | </span>4 cuotas de ${priceSelected && (priceSelected / 4).toLocaleString()} COP</p>
              <button onClick={() => {
                setPaymentMethod('monthly')
                setSubtotal(data.discount ? (data.discount / 4) : (data.price / 4))
                setPriceSelected(data.discount ? (data.discount / 4) : (data.price / 4))
              }} className='border-2 border-blueApp hover:bg-blueApp group transition-colors rounded-md'>
                <Plus className='text-blueApp w-5 h-5 group-hover:text-white transition-colors' />
              </button>
            </div>
          )
          }
        </div >
      }

    </section >
  )
}
