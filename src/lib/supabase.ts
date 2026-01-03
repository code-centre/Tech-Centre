"use client";
import { useState, useEffect } from 'react';
import { createClient } from './supabase/client';

// Cliente de Supabase para uso general (mantener compatibilidad)
export const supabase = createClient();

// Hook para obtener el usuario actual
export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabaseClient = createClient();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return profile;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // 1. Verificar la sesión actual
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) throw error;

        if (!mounted) return;

        if (session?.user) {
          // 2. Obtener el perfil completo del usuario
          const userProfile = await fetchUserProfile(session.user.id);
          
          if (!mounted) return;
          
          // 3. Combinar la información de auth con el perfil
          // El perfil tiene prioridad sobre session.user para evitar sobrescritura
          setUser({
            ...session.user,
            ...(userProfile || {})
          } as any);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // 4. Escuchar cambios en la autenticación
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            // El perfil tiene prioridad sobre session.user
            setUser({
              ...session.user,
              ...(userProfile || {})
            } as any);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}