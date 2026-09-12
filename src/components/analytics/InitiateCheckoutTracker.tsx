'use client';

import { useEffect } from 'react';
import { trackInitiateCheckout } from '@/lib/analytics/meta/events';

interface Props {
  programId: number;
  name: string;
  code: string;
  value?: number | null;
  email?: string | null;
  userId?: string | null;
  variant?: 'reservation' | 'standard';
}

export default function InitiateCheckoutTracker({
  programId,
  name,
  code,
  value,
  email,
  userId,
  variant = 'standard',
}: Props) {
  useEffect(() => {
    if (!name) return;
    trackInitiateCheckout({
      contentName: name,
      contentIds: code ? [code] : [String(programId)],
      value: value && value > 0 ? value : null,
      programId,
      email,
      userId,
      variant,
    });
  }, [programId, name, code, value, email, userId, variant]);

  return null;
}
