import { Plus, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

interface PaymentPlan {
  id: string;
  program_id: string;
  name: string;
  installments: number;
  discount_percent?: number;
  // Agrega más campos según la estructura de tu tabla payment_plans
}

export default function SelectPayment({ data, paymentMethod, setPaymentMethod, setSubtotal, setPriceSelected, priceSelected, setQuantity, isShort }: Props) {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentPlans = async () => {
      if (!data?.id) return;
      
      try {
        setLoading(true);
        const { data: plans, error: plansError } = await supabase
          .from('payment_plans')
          .select('*')
          .eq('program_id', data.id);

        if (plansError) throw plansError;

        // console.log('Planes de pago encontrados:', plans);
        setPaymentPlans(plans || []);
      } catch (err) {
        console.error('Error al cargar los planes de pago:', err);
        setError('Error al cargar las opciones de pago');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentPlans();
  }, [data?.id]);

  return (
    <section className='flex flex-col gap-5'>
      <h2 className='text-4xl font-bold mt-4'>Opciones de pago</h2>
      <div className='h-1 border-b'></div>
      <p className='font-semibold'>Financiación del curso</p>
      <p className=''>Queremos que formes parte de esta experiencia, por eso puedes elegir entre pagar el curso completo o dividirlo en cuotas comodas, abonando solo la inscripción para comenzar.</p>
      {paymentMethod &&
        <p className='flex items-center gap-2'>
          Opción de pago seleccionado:
          <span className='text-blueApp font-semibold'>
            {paymentPlans.find(plan => plan.id === paymentMethod)?.name || 'Método de pago'}
          </span>
          <button onClick={() => {
            setQuantity(1)
            setPaymentMethod(null)
            setSubtotal(null)
            setPriceSelected(data.discount ? data.discount : data.price)
          }} className='rounded-md border-2 border-red-500 hover:bg-red-500 transition-colors group'>
            <X className='text-red-500 w-4 h-4 group-hover:text-white transition-colors' />
          </button>
        </p>
      }
      {!paymentMethod && paymentPlans.length > 0 && (
        <div className='flex flex-col gap-4'>
          {paymentPlans.map((plan) => (
            <div 
              key={plan.id} 
              className='flex items-center justify-between p-4 rounded-lg '
            >
              <div className='flex items-center justify-between'>
                <p className=''>
                  <span className='text-blueApp font-semibold text-lg'>{plan.name} | </span>

                  <span className='text-white'>
                    {plan.installments > 1
                      ? `${(data?.default_price / plan.installments).toLocaleString()} COP x ${plan.installments} cuotas`
                      : `$${data?.default_price?.toLocaleString()} COP`}
                  </span>
                  {plan.discount_percent && (
                    <span> (Descuento del {plan.discount_percent}%)</span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => {
                      setPaymentMethod(plan.id)
                      setSubtotal(data.default_price/plan.installments)
                      console.log("precio",data.default_price/plan.installments)
                      console.log("el tipo de precio es:",typeof(data.default_price/plan.installments))
                      setPriceSelected(data.default_price/plan.installments)
                    }} 
                className="ml-4 p-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex-shrink-0">
                      <Plus className='text-white ' />
                    </button>
            </div>
          ))}
        </div>
      )}
      {/* {
        !paymentMethod && paymentPlans.length > 0 && (
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between'>
            <p className=''>
              <span className='text-blueApp font-semibold text-lg'>{paymentPlans[0].name} | </span>
              ${data.default_price} COP
              {paymentPlans[0].discount_percent &&
                <span> (Descuento del {paymentPlans[0].discount_percent} %)</span>
              }
            </p>
            <button onClick={() => {
                  setPaymentMethod('full')
                  setSubtotal(data.discount ? data.discount : data.price)
                  setPriceSelected(data.discount ? data.discount : data.price)
                }} className='border-2 border-blueApp hover:bg-blueApp group transition-colors rounded-md'>
                  <Plus className='text-blueApp w-5 h-5 group-hover:text-white transition-colors' />
                </button>
          </div>
        </div >
      )} */}

    </section >
  )
}
