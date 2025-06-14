'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { InfiniteMovingCards } from '@/components/InfiniteMovingCards';

interface Review {
  author_name: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

interface GoogleReviewsProps {
  placeId: string;
  maxReviews?: number;
}

const GoogleReviews = ({ placeId, maxReviews = 5 }: GoogleReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/google-reviews`, {
          params: { placeId }
        });

        if (response.data && response.data.result && response.data.result.reviews) {
          setReviews(response.data.result.reviews.slice(0, maxReviews));
        } else {
          setError('No se encontraron reseñas');
        }
      } catch (err) {
        setError('Error al cargar las reseñas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [placeId, maxReviews]);

  if (loading) return <div className="text-center py-10">Cargando reseñas...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Lo que dicen nuestros estudiantes</h2>
          <p className="mt-4 text-lg text-gray-600">
            Conoce las experiencias de quienes ya han transformado su carrera con nosotros
          </p>
        </div>
        <div className='py-8'>
          <InfiniteMovingCards
            direction="right"
            speed="slow"
            pauseOnHover={true}
            horizontalScroll={true}
          >
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-bgCard w-[350px] p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="text-4xl font-bold text-blue-500">&ldquo;</div>
                </div>

                <p className="text-gray-700 text-center mb-6 italic">
                  "{review.text.length > 150
                    ? `${review.text.substring(0, 150)}...`
                    : review.text}"
                </p>

                <div className="flex items-center justify-center mt-6">
                  <div className="flex-shrink-0 mr-3">
                    <Image
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{review.author_name}</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </InfiniteMovingCards>
        </div>        
        <div className="text-center mt-10">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=Tech+Centre&query_place_id=${placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blueApp hover:underline font-medium"
          >
            Ver todas nuestras reseñas en Google Maps →
          </a>
        </div>
      </div>
    </section>
  );
};

export default function Reviews() {
  const placeId = "ChIJv01Wyvot9I4RUtzmOXikbpM";

  return <GoogleReviews placeId={placeId} maxReviews={5} />;
}