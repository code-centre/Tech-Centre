'use client'

import { createClient } from '@/lib/supabase/client'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  // Con @supabase/ssr, el cliente maneja la sesión automáticamente
  // Ya no necesitamos SessionContextProvider
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  )
}