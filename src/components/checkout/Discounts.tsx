'use client'
import { db } from '@/../firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import React, { useState } from 'react'

export default function Discounts({ ticket, slugProgram, eventId, setShowQuantity, setQuantity, subtotal, quantity, setDiscount, data, isShort }: any) {
    const [errorDiscount, setErrorDiscount] = useState<string | null>(null)
    const [discountCode, setDiscountCode] = useState<string | null>(null)
    const [discountSuccess, setDiscountSuccess] = useState<boolean | null>(null)
  
    const handleSubmitDiscount = async (e: any) => {
        e.preventDefault()        
        setErrorDiscount(null)
        setDiscountSuccess(null)
         console.log(data, 'data');
         
        const inputValue = e.target["discount"].value.toUpperCase()
    
        const q = query(collection(db, "discounts"), where("code", "==", inputValue.toUpperCase()), where("productId", "==", isShort ? data.id : slugProgram), where("disable", "==", false));
        const querySnapshot = await getDocs(q);
        const discounts = querySnapshot.docs.map((doc) => doc.data())    
        console.log(discounts, 'discounts');
        
        if (discounts.length === 0) {
          setDiscount(0)
          setErrorDiscount("Código de descuento no válido")
          setDiscountSuccess(false)
          setDiscountCode(null)
          setShowQuantity(true)
          return
        }
    
        if (subtotal && quantity >= 1 && discounts[0].discount === 100) {
          setQuantity(1)
          setShowQuantity(false)
        }
        if (discounts.length > 0 && subtotal) {
          if (ticket?.price) {
            setDiscount(discounts[0].discount * (discounts[0].discount === 100 ? ticket?.price : subtotal) / 100)
          } else {
            setDiscount(Number((discounts[0].discount * subtotal / 100).toFixed(0)))
    
          }
          setDiscountSuccess(true)
          setDiscountCode(discounts[0].code)
          return
        }
      }

      
    return (
        <div className='flex flex-col gap-3'>
            <form onSubmit={(e) => handleSubmitDiscount(e)} className='flex gap-2'>
                <input
                    name="discount"
                    placeholder='Regalo o código de descuento'
                    className={`py-2 px-2 w-[60%] md:w-[80%] border rounded-md focus-visible:ring-blueApp ${errorDiscount ? 'border-red-500' : ''} ${discountSuccess ? 'border-green-500' : ''}`}
                    type="text"
                />
                <button className='bg-blueApp flex-1 h-full rounded-md text-white font-semibold'>
                    Aplicar
                </button>
            </form>
            {errorDiscount && <p className='text-red-500 text-sm'>{errorDiscount}</p>}
            {discountSuccess && <p className='text-green-500 text-sm'>Código de descuento aplicado correctamente</p>}
        </div>
    )
}
