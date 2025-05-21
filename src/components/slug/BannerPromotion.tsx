'use client'
import { auth } from '../../../firebase';
import Link from 'next/link';
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth';

export default function BannerPromotion() {
  const [user] = useAuthState(auth)
  return (
    <div className='mt-5'>
      {
        !user && <p className=" bg-white w-fit text-black py-1 px-5 font-semibold rounded-md text-sm">¡Inicia sesión y aprovecha el descuento por lanzamiento!</p>
      }
    </div>
  )
}
