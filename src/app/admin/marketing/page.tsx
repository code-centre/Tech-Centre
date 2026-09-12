import type { Metadata } from 'next';
import MarketingDashboard from './MarketingDashboard';

export const metadata: Metadata = {
  title: 'Marketing',
  description: 'Atribución, funnel y resultados de campañas.',
  robots: { index: false, follow: false },
};

export default function MarketingAdminPage() {
  return (
    <main className="container mx-auto" aria-label="Marketing y atribución">
      <MarketingDashboard />
    </main>
  );
}
