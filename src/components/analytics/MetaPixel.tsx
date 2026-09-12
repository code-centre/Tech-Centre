'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureAttributionFromLocation } from '@/lib/analytics/meta/attribution';
import { loadMetaPixel, newEventId, trackPixel } from '@/lib/analytics/meta/client';

let pageViewKey: string | null = null;

function MetaPixelInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? '';

  useEffect(() => {
    captureAttributionFromLocation();
    loadMetaPixel();

    const key = `${pathname}${search ? `?${search}` : ''}`;
    if (pageViewKey === key) return;
    pageViewKey = key;
    trackPixel('PageView', undefined, newEventId());
  }, [pathname, search]);

  return null;
}

export default function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelInner />
    </Suspense>
  );
}
