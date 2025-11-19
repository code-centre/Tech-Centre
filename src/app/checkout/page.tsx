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
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/supabase'; // Ajusta esta ruta según tu configuración


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
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)
  const [showQuantity, setShowQuantity] = useState<boolean>(true)
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1); // Valor por defecto 1


  const [data, setData] = useState<Program | null>(null);
  const slugProgram = searchParams.get('slug')
  const { user } = useUser();
  console.log("user activo es:",user)

  useEffect(() => {
    const fetchData = async () => {
    if (!slugProgram) {
      console.error('❌ No se proporcionó un slug de programa');
      setLoading(false);
      return;
    }

    console.log('🔍 Buscando programa con code:', slugProgram);
    
    try {
      console.log('🔄 Realizando consulta a Supabase...');
      const { data: programData, error } = await supabase
        .from('programs')
        .select('*')
        .eq('code', slugProgram)
        .single();

      console.log('✅ Respuesta de Supabase recibida');
      
      if (error) {
        console.error('❌ Error en la consulta:', error);
        throw error;
      }
      
      if (!programData) {
        console.error('❌ No se encontró ningún programa con el code:', slugProgram);
        throw new Error('No se encontró el programa');
      }

      console.log('📦 Datos del programa:', programData);
      setData(programData);

      if (programData.default_price) {
        console.log('💰 Precio del programa:', programData.default_price);
        setSubtotal(programData.default_price);
      } else {
        console.warn('⚠️ El programa no tiene precio definido');
      }
    } catch (error) {
      console.error('❌ Error al cargar el programa:', error);
    } finally {
      console.log('🏁 Finalizando carga de datos');
      setLoading(false);
    }
  };
    
    fetchData();
  }, [slugProgram]);



  useEffect(() => {
  if (!data) return;
  
  let calculateSubtotal = 0;
  
  if (paymentMethod === 'monthly') {
    calculateSubtotal = ((data.discount || data.price) / 4) * quantity;
  } else if (paymentMethod === 'full' || paymentMethod === null) {
    // Incluimos el caso donde paymentMethod es null
    calculateSubtotal = (data.discount || data.price) * quantity;
  }
  
  // Solo actualizamos si el valor es mayor que 0
  if (calculateSubtotal > 0) {
    setSubtotal(calculateSubtotal);
  }
}, [quantity, paymentMethod, data]);


console.log('selectedCohortId:', selectedCohortId);
  return (
    <main className={` mt-26 min-h-screen  ${!loading ? ' grid grid-cols-1 lg:grid-cols-2 mt-16' : ' grid place-content-center'}`}>
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
              ticket={null}
              setSubtotal={setSubtotal}
              slugProgram={data?.name || ''}
              subtotal={subtotal}
              setShowQuantity={setShowQuantity}
              showQuantity={showQuantity}
              selectedCohortId={selectedCohortId}
              setSelectedCohortId={setSelectedCohortId}
              selectedInstallments={selectedInstallments}
              setSelectedInstallments={setSelectedInstallments}
            />
            <ResumenSection
              user={user}
              data={data}
              slugProgram={slugProgram}
              selectedSchedule={selectedSchedule}
              quantity={quantity}
              subtotal={subtotal}
              period={paymentMethod}
              setQuantity={setQuantity}
              setShowQuantity={setShowQuantity}
              ticket={null}  // Add this line with appropriate value
              eventId={null} // Add this line with appropriate value
              selectedCohortId={selectedCohortId}
              selectedInstallments={selectedInstallments}
            />
          </>
      }
    </main >
  )
}
