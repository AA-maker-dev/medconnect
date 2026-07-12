import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { fetchHospitals, type Hospital } from '@/services/public.service';
import { Skeleton } from '@/components/shared/Skeleton';

export function HospitalPartnersSection() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHospitals()
      .then(setHospitals)
      .catch(() => setHospitals([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && hospitals.length === 0) return null;

  return (
    <section className="py-16 px-5 sm:px-8 border-y border-slate-100">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500 mb-8">
          Trusted by leading hospitals
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-32" />
              ))
            : hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="flex items-center gap-2 text-slate-500 grayscale hover:grayscale-0 hover:text-teal-700 transition-all duration-base"
                >
                  <Building2 className="h-5 w-5" />
                  <span className="font-display text-base">{hospital.name}</span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
