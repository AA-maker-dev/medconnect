import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DoctorCard } from '@/components/shared/DoctorCard';
import { DoctorCardSkeleton } from '@/components/shared/Skeleton';
import * as doctorService from '@/services/doctor.service';
import type { DoctorCard as DoctorCardType } from '@/types/doctor.types';

interface DoctorShowcaseSectionProps {
  title: string;
  subtitle: string;
  sortBy: 'rating' | 'recent' | 'experience';
  limit?: number;
  tone?: 'ivory' | 'transparent';
  /** When true, keeps only the first doctor per specialization (Featured Specialists). */
  uniqueBySpecialization?: boolean;
}

export function DoctorShowcaseSection({
  title,
  subtitle,
  sortBy,
  limit = 8,
  tone = 'transparent',
  uniqueBySpecialization = false,
}: DoctorShowcaseSectionProps) {
  const [doctors, setDoctors] = useState<DoctorCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    doctorService
      .listDoctors({ sortBy, limit: uniqueBySpecialization ? limit * 3 : limit })
      .then((list) => {
        if (cancelled) return;
        if (uniqueBySpecialization) {
          const seen = new Set<string>();
          const unique = list.filter((d) => {
            if (seen.has(d.specialization.id)) return false;
            seen.add(d.specialization.id);
            return true;
          });
          setDoctors(unique.slice(0, limit));
        } else {
          setDoctors(list);
        }
      })
      .catch(() => !cancelled && setDoctors([]))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [sortBy, limit, uniqueBySpecialization]);

  if (!isLoading && doctors.length === 0) return null;

  return (
    <section className={tone === 'ivory' ? 'bg-ivory-100 py-20 px-5 sm:px-8' : 'py-20 px-5 sm:px-8'}>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-500 font-body">{subtitle}</p>
          </div>
          <Link
            to="/doctors"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline shrink-0"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <DoctorCardSkeleton key={i} />)
            : doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
        </div>
      </div>
    </section>
  );
}
