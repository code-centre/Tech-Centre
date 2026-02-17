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
      console.log('Usuario no autenticado, redirigiendo a login');
      router.push('/iniciar-sesion');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      console.log('Usuario autenticado:', user);
      console.log('Rol del usuario:', user.role);
      if (user.role !== 'admin') {
        console.log('Usuario no es admin, redirigiendo a página principal');
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  // Verificar el rol de administrador
  if (user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}