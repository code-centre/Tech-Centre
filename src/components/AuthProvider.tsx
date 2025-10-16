// src/components/AuthProvider.tsx
'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthProvider({ 
  children,
  initialSession 
}: { 
  children: React.ReactNode;
  initialSession: any;
}) {
  const supabase = createClientComponentClient();
  
  return (
    <SessionContextProvider 
      supabaseClient={supabase} 
      initialSession={initialSession}
    >
      {children}
    </SessionContextProvider>
  );
}