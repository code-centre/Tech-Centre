'use client';

import { createClient } from '@/lib/supabase/client';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const AuthContext = createContext<{ 
  user: any; 
  loading: boolean;
  supabaseClient: ReturnType<typeof createClient> 
} | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export default function AuthProvider({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  // Cliente estable por sesión de navegación (sin singleton global)
  const supabaseClient = useMemo(() => createClient(), []);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener usuario inicial
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  // NO bloquear render - siempre renderizar children
  // Los componentes pueden usar loading para mostrar skeletons/loaders
  return (
    <AuthContext.Provider value={{ user, loading, supabaseClient }}>
      {children}
    </AuthContext.Provider>
  );
}