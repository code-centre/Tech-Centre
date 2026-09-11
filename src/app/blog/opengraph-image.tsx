import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Blog de Tech Centre';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

export default async function BlogIndexOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          background: 'linear-gradient(135deg, #07100D 0%, #0B1B2B 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -80,
            top: -140,
            width: 480,
            height: 480,
            borderRadius: 480,
            background: 'rgba(63, 224, 160, 0.16)',
            filter: 'blur(80px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
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
          <span
            style={{
              color: '#9FB6C4',
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 3,
              marginLeft: 8,
            }}
          >
            · BLOG
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span
            style={{
              color: '#F4F9F6',
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 980,
            }}
          >
            Ideas sobre tecnología, IA y cómo se aprende en el Caribe
          </span>
          <span
            style={{
              color: '#9FB6C4',
              fontSize: 24,
              lineHeight: 1.4,
              maxWidth: 820,
            }}
          >
            Artículos del equipo y la comunidad de Tech Centre
          </span>
        </div>

        <span
          style={{
            color: '#F4F9F6',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          techcentre.co/blog
        </span>
      </div>
    ),
    { ...size }
  );
}
