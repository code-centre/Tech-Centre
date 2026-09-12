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
}

export default function InitiateCheckoutTracker({
  programId,
  name,
  code,
  value,
  email,
  userId,
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
    });
  }, [programId, name, code, value, email, userId]);

  return null;
}
