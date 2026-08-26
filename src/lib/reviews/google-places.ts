/**
 * Reseñas de Google Places, leídas en el servidor.
 * Se cachean 24 horas para no gastar cuota en cada visita.
 */

export interface GoogleReview {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

export interface GooglePlaceReviews {
  rating: number | null;
  total: number | null;
  reviews: GoogleReview[];
}

const EMPTY: GooglePlaceReviews = { rating: null, total: null, reviews: [] };

/**
 * Trae calificación, total de reseñas y las reseñas destacadas de un lugar.
 * Devuelve valores vacíos si falta la llave o la API responde con error, para
 * que la sección se pueda ocultar sin romper la página.
 */
export async function getGooglePlaceReviews(
  placeId: string,
): Promise<GooglePlaceReviews> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!key) return EMPTY;

  const url =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${encodeURIComponent(placeId)}` +
    "&fields=rating,user_ratings_total,reviews&language=es" +
    `&key=${key}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return EMPTY;

    const data = await res.json();
    if (data.status !== "OK" || !data.result) return EMPTY;

    const reviews: GoogleReview[] = (data.result.reviews ?? [])
      .filter((r: GoogleReview) => r?.text?.trim())
      .map((r: GoogleReview) => ({
        author_name: r.author_name,
        profile_photo_url: r.profile_photo_url,
        rating: r.rating,
        text: r.text.trim(),
        relative_time_description: r.relative_time_description,
      }));

    return {
      rating: data.result.rating ?? null,
      total: data.result.user_ratings_total ?? null,
      reviews,
    };
  } catch (error) {
    console.error("No se pudieron cargar las reseñas de Google:", error);
    return EMPTY;
  }
}
