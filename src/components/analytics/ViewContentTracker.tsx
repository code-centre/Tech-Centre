'use client';

import { useEffect } from 'react';
import { trackViewContent } from '@/lib/analytics/meta/events';

interface Props {
  programId: number;
  name: string;
  code: string;
  category?: string | null;
  value?: number | null;
}

export default function ViewContentTracker({ programId, name, code, category, value }: Props) {
  useEffect(() => {
    if (!code && !name) return;
    const storageKey = `meta:viewcontent:${code || programId}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // continue
    }
    trackViewContent({
      contentName: name,
      contentIds: code ? [code] : [],
      contentCategory: category || name,
      value: value && value > 0 ? value : null,
      programId,
    });
  }, [programId, name, code, category, value]);

  return null;
}
