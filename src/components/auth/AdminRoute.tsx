// components/auth/AdminRoute.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/lib/supabase'; // Ajusta esta ruta según tu configuración

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/iniciar-sesion');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras cargamos usuario o perfil (el role viene del perfil)
  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  // Role undefined = perfil no cargó o no tiene role
  if (user.role === undefined) {
    router.push('/');
    return null;
  }

  // Verificar el rol (admin o instructor pueden acceder al panel)
  if (user.role !== 'admin' && user.role !== 'instructor') {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}