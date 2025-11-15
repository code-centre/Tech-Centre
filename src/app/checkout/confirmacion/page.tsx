"use client";
import { Ticket } from "@/components/Ticket";
import { db } from "@/../firebase";
import { formatDate } from "@/../utils/formatDate";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen relative overflow-hidden py-20 md:pt-0">
      <Suspense fallback={<div className="loader"></div>}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [statusTransaction, setStatusTransaction] = useState<string | null>('APPROVED');
  const [loading, setLoading] = useState(true);
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [movementData, setMovementData] = useState<any>(null)
  const id = searchParams.get("id");

  useEffect(() => {
    const getStatusTransaction = async () => {
      const resp = await fetch(
        `https://${process.env.NEXT_PUBLIC_MODE_WOMPI}.wompi.co/v1/transactions/${id}`
      );
      const { data } = await resp.json();
      console.log(data)

      // if (data.payment_link_id) {
      //   const qMovement = query(collection(db, "movements"), where("paymentId", "==", data.payment_link_id))

      //   const querySnapshotMovement = await getDocs(qMovement)
      //   const movement = querySnapshotMovement.docs[0].data()
      //   setMovementData(movement)
      //   let ref;
      //   if (movement.type === 'program') {
      //     ref = query(collection(db, "programs"), where("slug", "==", movement.productId));
      //   } else {
      //     ref = query(collection(db, "events"), where("slug", "==", movement.productId));
      //   }

      //   if (ref) {
      //     const snapshot = await getDocs(ref);
      //     setPurchaseData(snapshot.docs[0].data());
      //   }
      // }

      setStatusTransaction(data.status);
      setLoading(false);
    };

    getStatusTransaction();
  }, [statusTransaction, id]);

  return (
    <section>
      <div
        className="fixed inset-0 -z-1 flex items-center justify-center"
        style={{
          backgroundImage: `url('/loader-image.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
      <div className="absolute inset-0 bg-black/40 -z-1" />
      <div className=" mx-auto items-center justify-center min-h-screen px-5 flex flex-col gap-8">
        {loading ? (
          <div className="loader" />
        ) : (
          <section className="max-w-4xl w-full flex flex-col gap-3 text-center">
            {
              statusTransaction === 'APPROVED'
                // ? <Ticket
                //   type={movementData && movementData.type === 'program' ? 'program' : 'event'}
                //   title={movementData && movementData.type === 'program' ? `${purchaseData.name} ${purchaseData.subtitle}` : purchaseData.title}
                //   date={movementData && movementData.type === 'program' ? purchaseData.startDate : formatDate(purchaseData.date)}
                //   time={movementData && movementData.type === 'program' ? movementData.selectedSchedule : purchaseData.startHour}
                //   location={movementData && movementData.type === 'program' ? "Fundación código abierto" : purchaseData.title}
                //   code={id!}
                //   slug={purchaseData.slug}
                //   heroImage={purchaseData.heroImage}
                // />
                ? <div className="h-[250px] bg-gray-200 pt-4 max-w-sm mx-auto w-full mask rounded-t-md">
                  <p className="font-semibold">Compra aprobada =P </p>
                </div>
                : <div className="h-[250px] bg-gray-200 pt-4 max-w-sm mx-auto w-full mask rounded-t-md">
                  <p className="font-semibold">Compra no aprobada 😪</p>
                </div>
            }


            <div className="flex flex-col gap-4  ">
              {/* <button className="bg-blueApp text-white py-2 rounded-md">Descargar</button> */}
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">Orden con ID {id} {statusTransaction !== 'APPROVED' && 'no'} confirmada</h2>
              <Link href='/' className="bg-blueApp hover:bg-blue-600 transition-al duration-300 text-white py-2 rounded-md">Volver al inicio</Link>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

{/*  */ }