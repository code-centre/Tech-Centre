// src/app/empresas/trabajo/page.tsx
import SolicitarTrabajo from '@/components/empresas/SolicitarTrabajo';
import SolicitarPasantia from '@/components/empresas/SolicitarPasantia';

export default function TrabajoPage() {
  return (
    <main className="flex-1">
      <div id="trabajo">
        <SolicitarTrabajo 
        hayOfertas={false}
     /> 
      </div>
      <div id="pasantia">
        <SolicitarPasantia 
        hayOfertas={false}
     /> 
      </div>
    </main>
  );
}