// src/components/AuthProvider.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function AuthProvider({ 
  children,
  initialSession 
}: { 
  children: React.ReactNode;
  initialSession: any;
}) {
  const [supabaseClient] = useState(() => createClient());
  
  // El SessionContextProvider ya no es necesario con @supabase/ssr
  // El cliente maneja la sesión automáticamente
  return <>{children}</>;
}