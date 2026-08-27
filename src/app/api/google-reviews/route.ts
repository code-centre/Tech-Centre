import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(request: Request) {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous';

  const limit = rateLimit(`google-reviews:${clientIp}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSec) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'No se proporcionó un Place ID' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&language=es&key=${GOOGLE_PLACES_API_KEY}`,
      { next: { revalidate: 86400 } }
    );

    const data = await response.json();

    if (data.status !== "OK") {
      return NextResponse.json({ error: 'Error al obtener datos de Google Places API' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
