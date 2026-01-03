'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { InfiniteMovingCards } from '@/components/InfiniteMovingCards';
import { Star } from 'lucide-react';

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
          <div className="w-8 h-8 border-4 border-blueApp border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }

  if (!reviews.length) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blueApp">Lo que dicen nuestros estudiantes</h2>
          <p className="mt-4 text-lg text-white">
            Conoce las experiencias de quienes ya han transformado su carrera con nosotros
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
                className="bg-zinc-900 w-[350px] p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-zinc-800 shrink-0"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="text-4xl font-bold text-blueApp">&ldquo;</div>
                </div>

                <p className="text-white text-center mb-6 italic line-clamp-4">
                  {review.text.length > 150 ? `${review.text.substring(0, 150)}...` : review.text}
                </p>

                <div className="flex items-center justify-center gap-3 mt-6">
                  <Image
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-blueApp">{review.author_name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </InfiniteMovingCards>
        </div>

        <div className="text-center mt-10">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=Tech+Centre&query_place_id=${placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blueApp hover:underline font-medium inline-flex items-center gap-2"
          >
            Ver todas nuestras reseñas en Google Maps
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}