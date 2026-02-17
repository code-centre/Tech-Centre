// components/auth/AdminRoute.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/lib/supabase';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

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

  if (user.role === undefined) {
    router.push('/');
    return null;
  }

  // Admin puede acceder a todo /admin
  // Instructor solo puede acceder a /admin/blog
  const isAdminBlogRoute = pathname?.startsWith('/admin/blog');
  const canAccess =
    user.role === 'admin' ||
    (user.role === 'instructor' && isAdminBlogRoute);

  if (!canAccess) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}