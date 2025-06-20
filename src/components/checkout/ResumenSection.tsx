'use client'
import { db } from '@/../firebase'
import useUserStore from '@/../store/useUserStore'
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore'
import { ArrowLeft, Info, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import Modal from './Modal'
// import AuthModal from '../../AuthModal'
import Image from 'next/image'
// import AlertModal from '../AlertModal'
import Discounts from './Discounts'

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
}

export default function ResumenSection({ data, slugProgram, setQuantity, setShowQuantity, ticket, subtotal, quantity, eventId, selectedSchedule, period, isShort }: Props) {
  const { user } = useUserStore()
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
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: "",
    description: "",
  });

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

  const handleGetLinkToPay = async (idsToMovements: string[]) => {
    setDisableButton(true)
    if (subtotal && subtotal - discount > 0 && user) {
      const resp = await createPaymentId(subtotal - discount, `${isShort ? `${data.title} - ${data.subtitle}` : `${data!.name} - ${data.subtitle}`}`, isShort ? 'event' : 'program')
      await addDoc(collection(db, "movements"), {
        userID: user.id,
        date: serverTimestamp(),
        subtotal,
        total: subtotal - discount,
        discount,
        discountCode,
        paymentId: resp.id,
        status: 'PENDING',
        productId: slugProgram ? slugProgram : eventId,
        quantity,
        idsToMovements,
        ...(data?.title === 'Barranqui-IA' && { isVIP: ticket?.type === 'premium' }),
        ...(isShort ? { payments: 1, totalPayments: period === 'monthly' ? 2 : 1 } : { payments: 1, totalPayments: period === 'monthly' ? 4 : 1 }),
        type: isShort ? 'event' : 'program',
        selectedSchedule: slugProgram ? selectedSchedule : null,
        description: `Compra de ${slugProgram
          ? `diplomado - (${data.name} - ${data.subtitle})`
          : `boleta para evento - (${data.title})`}`,
      });

      const q = query(collection(db, "movements"), where("userID", "==", user.id));
      const querySnapshot = await getDocs(q);
      const userMovements = querySnapshot.docs.map((doc) => doc.data());

      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, {
        paymentLinkId: resp.id,
        movements: userMovements,

      });

      router.push(`https://checkout.wompi.co/l/${resp.id}`)
    }
    if (subtotal && subtotal - discount === 0 && user && eventId && isShort) {
      const addToAtendeesList = async () => {
        if (user) {
          const eventAtendeeRef = doc(collection(db, "eventAtendees"))
          await setDoc(eventAtendeeRef, {
            eventId,
            userId: user.id,
            nombre: user.name.toUpperCase(),
            ...(user.lastName && { apellido: user.lastName.toUpperCase() }),
            rol: "CUSTOMER",
            date: Timestamp.fromDate(new Date()),
            checkin: false,
            phone: user.phone || '',
            email: user.email,
            ticketId: 0,
          })
        }
      }

      const handleSendEmail = async () => {
        const qEvent = query(collection(db, "events"), where("id", "==", eventId))
        const querySnapshotEvent = await getDocs(qEvent)
        const event = querySnapshotEvent.docs[0].data()

        await fetch('/api/send-email', {
          method: 'POST',
          body: JSON.stringify({
            user,
            type: 'event',
            title: event.title,
            date: event.date,
            time: event.startHour,
            location: `${event.location.mapUrl} - ${event.location.title} `,
            code: '12323',
            isHackthon: true,
          })
        })
      }

      setTimeout(async () => {
        setAlertState({
          isOpen: true,
          title: "Inscripción exitosa",
          description: "¡Disfruta de este evento!",
        });
        await addToAtendeesList()
        await handleSendEmail()
        router.back()
      }, 200);
    }
    if (subtotal && subtotal - discount === 0 && user && slugProgram) {

      const addToAtendeesList = async () => {
        if (user) {
          const eventAtendeeRef = doc(collection(db, "programRegister"))
          await setDoc(eventAtendeeRef, {
            programId: slugProgram,
            userId: user.id,
            nombre: user.name.toUpperCase(),
            ...(user.lastName && { apellido: user.lastName.toUpperCase() }),
            rol: "CUSTOMER",
            phone: user.phone,
            date: Timestamp.fromDate(new Date()),
            checkin: false,
            email: user.email,
            ticketId: 0,
            selectedSchedule: selectedSchedule,
            payments: 1,
            totalPayments: period === 'monthly' ? 4 : 1,
            total: subtotal,
            schedule: selectedSchedule,
            isProgram: true,
          })
        }
      }

      const handleSendEmail = async () => {
        const qEvent = query(collection(db, "programs"), where("slug", "==", slugProgram))
        const querySnapshotEvent = await getDocs(qEvent)
        const event = querySnapshotEvent.docs[0].data()

        await fetch('/api/send-email', {
          method: 'POST',
          body: JSON.stringify({
            user,
            type: 'program',
            title: event.name,
            date: event.startDate,
            time: selectedSchedule,
            location: 'Cra. 50 #72-126',
            code: '12323',
            isHackthon: false,
          })
        })
      }

      setTimeout(async () => {
        setAlertState({
          isOpen: true,
          title: "Inscripción exitosa",
          description: "¡Disfruta de este evento!",
        });
        await addToAtendeesList()
        await handleSendEmail()
        router.back()
      }, 200);
    }
  }

  // Ajuste de estética: glassmorphism, fondo oscuro, bordes, sombras y colores coherentes
  return (
    <div className='bg-bgCard/80 backdrop-blur-md w-full flex flex-col gap-5 pt-16 md:pt-24 px-6 md:px-20 lg:px-14 pb-10 lg:pb-0 rounded-2xl shadow-2xl border border-blue-100/20 max-w-2xl mx-auto'>
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
                  <span className='text-blueApp/60'>Batch 02</span>
                </div>
            }
          </div>
        </div>
        <div className='mt-5 md:mt-0'>
          {
            isShort
              ?
              <p className='font-semibold text-blueApp text-xl'>${ticket && ticket.price.toLocaleString()}</p>
              :
              <p className='font-semibold text-blueApp text-xl'>${data.discount ? data.discount?.toLocaleString() : data.price?.toLocaleString()}</p>
          }
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
        description: type === 'event' ? 'Compra de boleta para curso especializado' : 'Inscripción para curso',
        single_use: true,
        collect_shipping: false,
        amount_in_cents: amount * 100,
        currency: "COP",
        redirect_url: "http://localhost:3000/checkout/confirmacion",
      }),
    });
    const createdLink = await resp.json();
    return createdLink.data;
  } catch (err) {
    console.log(err);
  }
};
