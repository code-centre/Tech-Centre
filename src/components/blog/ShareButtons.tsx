'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title: string;
  url: string;
  excerpt?: string | null;
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.23 10.16 22.1 1h-1.87l-6.83 7.95L7.96 1H1.2l8.26 12.02L1.2 23h1.87l7.22-8.4L16.04 23h6.76l-8.57-12.84Zm-2.56 2.97-1.2-1.72-6.3-9h2.71l5.08 7.27 1.2 1.72 6.6 9.44h-2.71l-5.38-7.71Z"
      />
    </svg>
  );
}

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10.02 10.02 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2Zm0 17.97h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.2.84.85-3.11-.2-.32a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.72-8.23 8.3-8.23 2.22 0 4.3.86 5.86 2.41a8.16 8.16 0 0 1 2.43 5.83c0 4.54-3.72 8.3-8.24 8.3Zm4.55-6.21c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.3.18-.55.06-.25-.13-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.14-.24-.02-.38.11-.5.12-.12.25-.3.38-.46.12-.15.16-.26.25-.43.08-.17.04-.32-.02-.45-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.16 0-.43.06-.65.3-.23.24-.86.84-.86 2.05s.88 2.37 1 2.54c.12.16 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.16-.48-.29Z"
      />
    </svg>
  );
}

function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z"
      />
    </svg>
  );
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.68 0H1.32C.59 0 0 .6 0 1.33v21.34C0 23.4.59 24 1.32 24h11.5v-9.29H9.69v-3.62h3.13V8.41c0-3.1 1.89-4.79 4.66-4.79 1.32 0 2.46.1 2.79.14v3.24h-1.92c-1.5 0-1.79.72-1.79 1.76v2.31h3.59l-.47 3.62h-3.12V24h6.12c.73 0 1.32-.6 1.32-1.33V1.33C24 .6 23.41 0 22.68 0Z"
      />
    </svg>
  );
}

function shareMessage(title: string, excerpt?: string | null): string {
  const line = excerpt?.trim() ? `${title} — ${excerpt.trim()}` : title;
  return `Lee «${line}» en Tech Centre`;
}

export default function ShareButtons({ title, url, excerpt }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const text = shareMessage(title, excerpt);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text}\n${url}`);

  const networks = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedText}`,
      icon: WhatsAppLogo,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: LinkedInLogo,
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`,
      icon: XLogo,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FacebookLogo,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Enlace copiado');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('No se pudo abrir el menú para compartir');
    }
  };

  return (
    <nav aria-label="Compartir este artículo">
      <p className="mb-3 text-sm font-medium text-text-muted">Comparte este artículo</p>
      <ul className="flex flex-wrap items-center gap-2">
        {canNativeShare && (
          <li>
            <button
              type="button"
              onClick={nativeShare}
              className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm text-text-primary transition-colors hover:border-secondary/50 hover:bg-bg-secondary hover:text-secondary"
            >
              <Share2 className="h-4 w-4" />
              <span>Compartir</span>
            </button>
          </li>
        )}
        {networks.map(({ name, href, icon: Icon }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm text-text-primary transition-colors hover:border-secondary/50 hover:bg-bg-secondary hover:text-secondary"
            >
              <Icon className="h-4 w-4" />
              <span>{name}</span>
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm text-text-primary transition-colors hover:border-secondary/50 hover:bg-bg-secondary hover:text-secondary"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copiado' : 'Copiar enlace'}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
