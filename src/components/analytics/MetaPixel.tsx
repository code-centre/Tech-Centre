'use client';

import { useEffect } from 'react';
import { captureAttributionFromLocation } from '@/lib/analytics/meta/attribution';
import { loadMetaPixel, newEventId, trackPixel } from '@/lib/analytics/meta/client';

let pageViewKey: string | null = null;

export default function MetaPixel() {
  useEffect(() => {
    captureAttributionFromLocation();
    loadMetaPixel();

    const key = `${window.location.pathname}${window.location.search}`;
    if (pageViewKey === key) return;
    pageViewKey = key;
    trackPixel('PageView', undefined, newEventId());
  }, []);

  return null;
}
