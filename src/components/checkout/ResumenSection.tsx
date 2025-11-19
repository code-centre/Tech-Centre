'use client'
import { db } from '@/../firebase'
// import useUserStore from '@/../store/useUserStore'
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore'
import { ArrowLeft, Info, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import Modal from './Modal'
// import AuthModal from '../../AuthModal'
import Image from 'next/image'
// import AlertModal from '../AlertModal'
import Discounts from './Discounts'
import { supabase } from '@/lib/supabase'

interface Props {
  data: any
  slugProgram: string | null
  ticket: Ticket | null
  subtotal: number | null
  quantity: number
  eventId: string | null
  selectedSchedule: string | null
  period: string | null
  setQuantity: (quantity: number) => void
  setShowQuantity: (showQuantity: boolean) => void
  isShort?: boolean
  user?: User | null
  selectedCohortId: number | null;
  selectedInstallments: number;
}

export default function ResumenSection({ data, slugProgram, setQuantity, setShowQuantity, ticket, subtotal, quantity, eventId, selectedSchedule, period, isShort, user, selectedCohortId, selectedInstallments }: Props) {
  
  const router = useRouter()
  const [discount, setDiscount] = useState<number>(0)
  const [errorDiscount, setErrorDiscount] = useState<string | null>(null)
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [discountSuccess, setDiscountSuccess] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [disableButton, setDisableButton] = useState<boolean>(false)
  const [typeUser, setTypeUser] = useState<string | null>(null)
  // const [isVip, setIsVip] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const paymentCount = selectedInstallments; // Usa el valor de las cuotas seleccionadas

  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    description: "",
  });
  console.log('selectedCohortId: en ResumenSection', selectedCohortId);
  console.log('selectedInstallments: en ResumenSection', selectedInstallments);

  useEffect(() => {
    if (!period) {
      setDiscount(0)
    }
  }, [period])

  const handleLoginSucces = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setAlertState({
        isOpen: true,
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido de vuelta!",
      });
    }, 200);
  }

  const handleGetLinkToPay = async () => {
  setDisableButton(true);
  
  try {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    if (!subtotal) {
      throw new Error('Subtotal no definido');
    }

    const totalAmount = subtotal - discount;
    // const amountPerPayment = totalAmount / paymentCount;

    // En tu función handleGetLinkToPay, reemplaza la validación actual con:
console.log('Datos del producto recibidos:', {
  name: data?.name,
  subtitle: data?.subtitle,
  kind: data?.kind,
  dataCompleta: data // Mostrar todos los datos disponibles
});

if (!data) {
  throw new Error('No se encontraron datos del producto');
}

const requiredFields = ['name', 'subtitle', 'kind'];
const missingFields = requiredFields.filter(field => !data[field]);

if (missingFields.length > 0) {
  throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
}

    // 2. Crear el pago en Wompi
    console.log('Creando pago en Wompi...');
    const resp = await createPaymentId(
      totalAmount, 
      `${data.name} - ${data.subtitle}`, 
      data.kind
    );

    if (!resp?.id) {
      throw new Error('No se pudo crear el pago en Wompi');
    }

const { data: enrollment, error: enrollmentError } = await supabase
  .from('enrollments')
  .insert({
    cohort_id: selectedCohortId,  // Asegúrate de que esto sea un bigint
    student_id: user.id,  // Asegúrate de que user.id sea un UUID
    status: 'pending_payment',
    agreed_price: totalAmount,  // Asegúrate de que sea un número
  })
  .select()
  .single();

if (enrollmentError) {
  console.error('Error al crear matrícula:', enrollmentError);
  throw new Error(`Error al crear la matrícula: ${enrollmentError.message}`);
}

    // 3. Preparar las facturas
const currentDate = new Date();
// Calcular el monto de cada cuota
const baseAmount = Number(data.discount) || Number(data.default_price);
if (isNaN(baseAmount) || baseAmount <= 0) {
  throw new Error('El monto base no es válido');
}

if (!paymentCount || paymentCount < 1) {
  throw new Error('El número de cuotas no es válido');
}

const amountPerPayment = Number((baseAmount / paymentCount).toFixed(2));

// Crear las facturas
const invoices = Array.from({ length: paymentCount }).map((_, index) => {
  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + index);
  
  // Calcular el monto de la cuota
  let paymentAmount;
  if (index === paymentCount - 1) {
    // Para la última cuota, asegurarse de que la suma sea exacta
    const previousPayments = amountPerPayment * index;
    paymentAmount = Number((baseAmount - previousPayments).toFixed(2));
  } else {
    paymentAmount = amountPerPayment;
  }

  // Validar que el monto sea un número válido
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    console.error('Monto de pago inválido:', {
      index,
      paymentAmount,
      baseAmount,
      amountPerPayment
    });
    throw new Error(`El monto de la cuota ${index + 1} no es válido`);
  }

  return {
    enrollment_id: enrollment.id,
    label: `Pago ${index + 1} de ${paymentCount} - ${data.name}`,
    amount: paymentAmount,
    due_date: dueDate.toISOString().split('T')[0],
    status: 'pending',
    meta: {
      payment_id: resp.id,
      product_type: isShort ? 'event' : 'program',
      product_id: slugProgram || eventId || 'unknown',
      user_id: user.id,
      payment_number: index + 1,
      total_payments: paymentCount
    }
  };
});

    // 4. Insertar facturas en Supabase
    // Reemplaza la inserción con:
console.log('Insertando facturas en Supabase...');
const { data: createdInvoices, error: invoiceError } = await supabase
  .from('invoices')
  .insert(invoices)
  .select();

if (invoiceError) {
  console.error('Error detallado de Supabase:', {
    message: invoiceError.message,
    details: invoiceError.details,
    hint: invoiceError.hint,
    code: invoiceError.code
  });
  throw new Error(`Error al crear facturas: ${JSON.stringify(invoiceError, null, 2)}`);
}

if (!createdInvoices || createdInvoices.length === 0) {
  throw new Error('No se recibió confirmación de la creación de facturas');
}

console.log(`${createdInvoices.length} facturas creadas exitosamente:`, createdInvoices);

    // 5. Redirigir al pago
    console.log('Redirigiendo a Wompi...');
    router.push(`https://checkout.wompi.co/l/${resp.id}`);

  } catch (error) {
    console.error('Error en handleGetLinkToPay:', {
      error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    setAlertState({
      isOpen: true,
      title: "Error",
      description: error instanceof Error 
        ? `Error: ${error.message}` 
        : "Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
    });
  } finally {
    setDisableButton(false);
  }
};

  // Ajuste de estética: glassmorphism, fondo oscuro, bordes, sombras y colores coherentes
  return (
    <div className='bg-bgCard/80 backdrop-blur-md w-full flex flex-col gap-5 pt-16 md:pt-24 px-6 md:px-20 lg:px-14 pb-10 lg:pb-0 rounded-2xl shadow-2xl border border-blue-100/20 max-w-xl'>
      <h2 className='text-4xl font-bold font-mono text-blueApp'>Resumen de pago</h2>
      <div className='border-b border-blueApp/20 h-1'></div>
      <div className='flex flex-col md:flex-row justify-between'>
        <div className='flex gap-2'>
          <Image
            src={isShort ? data.heroImage : data.image}
            alt={isShort ? data.title : data.name}
            width={64}
            height={64}
            unoptimized // puedes quitar esto si usas imágenes del /public
            className="w-32 h-32 rounded-md object-cover bg-center border border-blueApp/10 shadow-lg"
          />
          <div>
            {
              isShort
                ? <p className='font-semibold text-white'>{data.title}</p>
                : <p className='font-semibold max-w-64 text-white'>{data.name}</p>
            }
            {
              isShort
                ?
                <span className='text-blueApp/80'>{data.type.charAt(0).toUpperCase() + data.type.slice(1)}</span>
                :
                <div className='flex flex-col text-sm'>
                  <span className='text-blueApp/80'>{data.subtitle}</span>
                  {/* <span className='text-blueApp/60'>Batch 02</span> */}
                </div>
            }
          </div>
        </div>
        <div className='mt-5 md:mt-0'>
          <p className='font-semibold text-blueApp text-xl'>
            ${data.default_price?.toLocaleString()}
          </p>
          <span className='text-blueApp/70'>COP</span>
        </div>
      </div>
      <div className='border-b border-blueApp/20 h-1'></div>

      <Discounts setShowQuantity={setShowQuantity} setQuantity={setQuantity} subtotal={subtotal} quantity={quantity} discount={discount} setDiscount={setDiscount} ticket={ticket} slugProgram={slugProgram} eventId={eventId} data={data} isShort={isShort} />

      <div className='border-b border-blueApp/20 h-1'></div>
      <div className='flex justify-between items-center'>
        <p className='font-semibold text-white'>Subtotal</p>
        <p className='text-white'>{subtotal ? `$${subtotal.toLocaleString()}` : 'Sin elegir'}</p>
      </div>
      <div className='flex justify-between items-center'>
        <p className='font-semibold text-white'>Descuento</p>
        <p className='text-blueApp'>${discount?.toLocaleString()}</p>
      </div>
      <div className='border-b border-blueApp/20 h-1'></div>
      <div className='flex justify-between items-center'>
        <div>
          <p className='font-semibold text-white'>Total</p>
          <span className='text-blueApp/70 text-sm'>Pago por {isShort ? 'curso especializado' : 'diplomado'}</span>
        </div>
        <p className='font-semibold text-3xl md:text-4xl text-blueApp'>{subtotal ? `$${(subtotal - discount).toLocaleString()}` : 'Sin elegir'}</p>
      </div>

      <button onClick={() => {
        if (!user) {
          setIsModalOpen(true)
          return
        }
        setShowModal(true)
      }} disabled={slugProgram ? !subtotal || !selectedSchedule : !discountCode && ticket?.price !== 80000 && eventId === '0AV0Wdoz4lj57CbZ94eT' ? true : !subtotal} className='bg-blueApp py-3 disabled:bg-gray-400 text-white text-xl font-semibold my-5 rounded-md shadow-lg hover:bg-blueApp/90 transition-colors'>Pagar {subtotal ? `$${(subtotal - discount).toLocaleString()}` : '$0'}</button>
      <p className='text-blueApp/70 text-sm'>Tus datos personales se utilizarán para procesar tu pedido, respaldar tu experiencia en este sitio web y para otros fines descritos en nuestra política de privacidad.</p>
      {/* <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onLogin={handleLoginSucces} /> */}

      {
        showModal && (
          <Modal disableButton={disableButton} slugProgram={slugProgram} titleEntity={slugProgram ? data.name : data.title} handleGoToPay={handleGetLinkToPay} quantity={quantity} setShowModal={setShowModal} eventId={eventId} />
        )
      }

      {/* <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ isOpen: false, title: "", description: "" })}
        title={alertState.title}
        description={alertState.description}
      /> */}
    </div>)
}

const createPaymentId = async (amount: number, name: string, type: string) => {
  try {
    const resp = await fetch(`https://${process.env.NEXT_PUBLIC_MODE_WOMPI}.wompi.co/v1/payment_links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_WOMPI_SECRET_KEY}`,
      },
      body: JSON.stringify({
        name,
        description: 'Inscripción para' + type,
        single_use: true,
        collect_shipping: false,
        amount_in_cents: amount * 100,
        currency: "COP",
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/confirmacion`,
      }),
    });
    const createdLink = await resp.json();
    return createdLink.data;
  } catch (err) {
    console.log(err);
  }
};
