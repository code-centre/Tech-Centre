'use client'
import ConfigurationSection from '@/components/checkout/ConfigurationSection'
import ResumenSection from '@/components/checkout/ResumenSection'
import Wrapper from '@/components/Wrapper'
import { db } from '@/../firebase'
import useUserStore from '@/../store/useUserStore'
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { Minus, Plus, PlusSquare, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import { useCollection } from 'react-firebase-hooks/firestore'

export default function ViewCheckoutPage() {
  return (
    <main className='relative'>
      <Suspense fallback={<div className="loader"></div>}>
        <ViewCheckoutContent />
      </Suspense>
    </main>
  );
}

function ViewCheckoutContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<boolean>(true)
  const [subtotal, setSubtotal] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)
  const [showQuantity, setShowQuantity] = useState<boolean>(true)


  const [data, setData] = useState<Program | any>({});
  const ticketId = searchParams.get('ticket')
  const slugProgram = searchParams.get('slug')
  const eventId = searchParams.get('eventId')
  const isShort = searchParams.get('isShort') === 'true';

  useEffect(() => {
    const fetchData = async () => {
      let ref;

      if (!isShort) {
        ref = query(collection(db, "programs"), where("slug", "==", slugProgram));
      } else {
        ref = query(collection(db, "events"), where("slug", "==", slugProgram));
      }

      if (ref) {
        const snapshot = await getDocs(ref);
        setData(snapshot.docs[0].data());
        if (isShort) {
          let newTicketId: number | null = null
          setSubtotal(snapshot.docs[0].data().tickets[0].price)
          setTicket(snapshot.docs[0].data().tickets[0])
        }
        setLoading(false)
      }
    };
    fetchData();
  }, [slugProgram, eventId]);



  useEffect(() => {
    if (isShort) {
      if (paymentMethod === 'monthly' && ticket) {
        setSubtotal((ticket.price / 2) * quantity)
      } else {
        setSubtotal(ticket && (ticket.price * quantity))
      }
    } else {
      let calculateSubtotal = 0
      if (paymentMethod === 'monthly' && data.discount) {
        calculateSubtotal = (data.discount / 4) * quantity
      } else if (paymentMethod === 'monthly' && !data.discount) {
        calculateSubtotal = (data.price / 4) * quantity
      } else if (paymentMethod === 'full' && data.discount) {
        calculateSubtotal = data.discount * quantity
      } else if (paymentMethod === 'full' && !data.discount) {
        calculateSubtotal = data.price * quantity
      }
      setSubtotal(calculateSubtotal)
    }
  }, [quantity])


  return (
    <main className={`min-h-screen  ${!loading ? ' grid grid-cols-1 lg:grid-cols-2 mt-16' : ' grid place-content-center'}`}>
      {
        loading
          ? <div className="flex justify-center items-center h-screen">
            <div className="loader"></div>
          </div>
          : <>
            <ConfigurationSection
              paymentMethod={paymentMethod}
              selectedSchedule={selectedSchedule}
              setSelectedSchedule={setSelectedSchedule}
              data={data}
              setPaymentMethod={setPaymentMethod}
              quantity={quantity}
              setQuantity={setQuantity}
              setSubtotal={setSubtotal}
              slugProgram={slugProgram}
              subtotal={subtotal}
              ticket={ticket}
              setShowQuantity={setShowQuantity}
              showQuantity={showQuantity}
            />
            <ResumenSection
              data={data}
              ticket={ticket}
              slugProgram={slugProgram}
              eventId={eventId}
              selectedSchedule={selectedSchedule}
              quantity={quantity}
              subtotal={subtotal}
              isShort={isShort}
              period={paymentMethod}
              setQuantity={setQuantity}
              setShowQuantity={setShowQuantity}
            />
          </>
      }
    </main >
  )
}
