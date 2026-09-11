import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const alt = 'Artículo del blog de Tech Centre';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

function publicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function absoluteCover(cover: string | null | undefined): string | null {
  if (!cover) return null;
  if (cover.startsWith('http')) return cover;
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://www.techcentre.co';
  return `${base.replace(/\/$/, '')}${cover.startsWith('/') ? '' : '/'}${cover}`;
}

export default async function BlogOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = publicSupabase();

  let title = 'Tech Centre';
  let coverUrl: string | null = null;

  if (supabase) {
    const { data } = await supabase
      .from('blog_posts')
      .select('title, cover_image')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (data?.title) title = data.title;
    coverUrl = absoluteCover(data?.cover_image);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(135deg, #07100D 0%, #0B1B2B 100%)',
        }}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              width: 1200,
              height: 630,
              objectFit: 'cover',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background: coverUrl
              ? 'linear-gradient(180deg, rgba(7,16,13,0.25) 0%, rgba(7,16,13,0.82) 100%)'
              : 'transparent',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '56px 64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                width: 18,
                height: 18,
                background: '#3FE0A0',
                transform: 'rotate(45deg)',
                borderRadius: 3,
              }}
            />
            <span
              style={{
                color: '#3FE0A0',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 6,
              }}
            >
              TECH CENTRE
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span
              style={{
                color: '#F4F9F6',
                fontSize: title.length > 70 ? 44 : 56,
                fontWeight: 800,
                lineHeight: 1.15,
                maxWidth: 1000,
              }}
            >
              {title}
            </span>
            <span
              style={{
                color: '#9FB6C4',
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              techcentre.co/blog
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
