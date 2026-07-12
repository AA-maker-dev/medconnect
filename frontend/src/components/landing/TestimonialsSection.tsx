import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { fetchFeaturedReviews } from '@/services/review.service';
import { Skeleton } from '@/components/shared/Skeleton';
import type { FeaturedReview } from '@/types/doctor.types';

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<FeaturedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedReviews(6)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && reviews.length === 0) return null;

  return (
    <section className="py-20 px-5 sm:px-8 bg-ivory-100">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
            What patients are saying
          </h2>
          <p className="text-slate-500 font-body max-w-xl mx-auto">
            Real reviews from real appointments — every rating comes from a completed
            visit.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-lg" />
              ))
            : reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: (i % 3) * 0.08 }}
                  className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-md flex flex-col"
                >
                  <Quote className="h-6 w-6 text-teal-500/40 mb-3" />
                  <p className="text-slate-700 font-body text-sm leading-relaxed mb-5 flex-1">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star
                        key={star}
                        className={
                          star < review.rating
                            ? 'h-4 w-4 text-amber-600 fill-amber-600'
                            : 'h-4 w-4 text-slate-300'
                        }
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {review.patientName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Patient of {review.doctorName} · {review.doctorSpecialization}
                    </p>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
