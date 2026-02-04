'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { InfiniteMovingCards } from '@/components/InfiniteMovingCards';
import { Star, ArrowRight } from 'lucide-react';

interface Review {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  text: string;
}

export default function Reviews() {
  const placeId = "ChIJv01Wyvot9I4RUtzmOXikbpM";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/api/google-reviews', {
          params: { placeId }
        });

        if (response.data?.result?.reviews) {
          setReviews(response.data.result.reviews.slice(0, 5));
        }
      } catch (err) {
        console.error('Error al cargar reseñas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [placeId]);

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }

  if (!reviews.length) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary">Lo que dicen nuestros estudiantes</h2>
          <p className="mt-4 text-lg text-text-primary">
            Historias reales de personas que decidieron aprender tecnología en Tech Centre
          </p>
        </div>

        <div className="py-8">
          <InfiniteMovingCards
            direction="left"
            speed="slow"
            pauseOnHover={true}
          >
            {/* Duplicar las reseñas para que se vean desde el inicio */}
            {[...reviews, ...reviews].map((review, index) => (
              <li
                key={`${review.author_name}-${index}`}
                className="card-background w-[350px] sm:w-[380px] p-5 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border [border-color:var(--card-curso-border)] shrink-0 flex flex-col"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="text-4xl font-bold text-secondary">&ldquo;</div>
                </div>

                <p className="text-text-primary text-center mb-4 italic line-clamp-3 text-sm sm:text-base leading-relaxed grow">
                  {review.text}
                </p>

                <div className="flex items-center justify-center gap-3 mt-auto pt-4 border-t border-white/10">
                  <Image
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    width={40}
                    height={40}
                    className="rounded-full shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-secondary truncate">{review.author_name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 shrink-0 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </InfiniteMovingCards>
        </div>

        <div className="text-center">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=Tech+Centre&query_place_id=${placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline font-medium inline-flex items-center gap-2"
          >
            Ver todas nuestras reseñas en Google Maps
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}