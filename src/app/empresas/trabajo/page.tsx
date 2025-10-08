// src/app/empresas/trabajo/page.tsx
import SolicitarTrabajo from '@/components/empresas/SolicitarTrabajo';

export default function TrabajoPage() {
  return (
    <main className="flex-1">
     <SolicitarTrabajo 
        hayOfertas={true}
     /> 
    </main>
  );
}