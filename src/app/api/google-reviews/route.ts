import { NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'No se proporcionó un Place ID' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&language=es&key=${GOOGLE_PLACES_API_KEY}`,
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