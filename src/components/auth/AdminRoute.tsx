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

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  // Verificar el rol de administrador
  if (user.role !== 'admin') {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}