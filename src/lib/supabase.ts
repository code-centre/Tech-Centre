"use client";
import { useMemo, useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';

export function useSupabaseClient() {
  const authContext = useAuthContext();
  
  return useMemo(() => authContext.supabaseClient, [authContext.supabaseClient]);
}

export function useUser() {
  const authContext = useAuthContext();
  const supabaseClient = useSupabaseClient();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  
  // Cargar perfil cuando el usuario esté disponible
  useEffect(() => {
    if (!authContext.user) {
      setProfile(null);
      setLoadingProfile(false);
      setLoadedUserId(null);
      return;
    }
    
    // Solo cargar si es un usuario diferente o no hemos cargado aún
    if (authContext.user.id !== loadedUserId && !loadingProfile) {
      setLoadingProfile(true);
      supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', authContext.user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data);
          }
          setLoadedUserId(authContext.user.id); // Marcar como cargado (éxito o error)
          setLoadingProfile(false);
        });
    }
  }, [authContext.user?.id, supabaseClient, loadedUserId, loadingProfile]);
  
  // Combinar usuario de auth con perfil
  const userWithProfile = useMemo(() => {
    if (!authContext.user) return null;
    return {
      ...authContext.user,
      ...(profile || {}),
    };
  }, [authContext.user, profile]);
  
  // Exponer loading: incluye cuando hay usuario pero el perfil aún no se ha cargado
  // (evita que AdminRoute redirija a home por race condition en la primera carga)
  const profilePending = authContext.user && profile == null && loadedUserId !== authContext.user?.id;
  return {
    user: userWithProfile,
    loading: authContext.loading || loadingProfile || !!profilePending,
  };
}
