"use client";
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// En lib/supabase.ts o similar
export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // 1. Verificar la sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          // 2. Obtener el perfil completo del usuario
          const userProfile = await fetchUserProfile(session.user.id);
          
          // 3. Combinar la información de auth con el perfil
          setUser({
            ...session.user,
            ...userProfile
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error en useUser:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // 4. Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          setUser({
            ...session.user,
            ...userProfile
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // console.log("User:", user);
  return { user, loading };
}