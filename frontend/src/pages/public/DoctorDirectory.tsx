import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { DoctorCard } from '@/components/shared/DoctorCard';
import { DoctorCardSkeleton } from '@/components/shared/Skeleton';
import { Select } from '@/components/ui/Select';
import * as doctorService from '@/services/doctor.service';
import { fetchSpecializations, type Specialization } from '@/services/public.service';
import type { DoctorCard as DoctorCardType } from '@/types/doctor.types';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest rated' },
  { value: 'experience', label: 'Most experienced' },
  { value: 'recent', label: 'Recently joined' },
];

export default function DoctorDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const specializationId = searchParams.get('specializationId') ?? '';
  const sortBy = (searchParams.get('sortBy') as 'rating' | 'experience' | 'recent') ?? 'rating';

  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [doctors, setDoctors] = useState<DoctorCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpecializations()
      .then(setSpecializations)
      .catch(() => setSpecializations([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    doctorService
      .listDoctors({ sortBy, specializationId: specializationId || undefined, limit: 24 })
      .then(setDoctors)
      .catch(() => setDoctors([]))
      .finally(() => setIsLoading(false));
  }, [specializationId, sortBy]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-slate-900 mb-2">Find a doctor</h1>
        <p className="text-slate-500 font-body">
          Browse verified doctors, or{' '}
          <button onClick={() => navigate('/search')} className="text-teal-700 font-semibold hover:underline">
            search by what you're dealing with
          </button>{' '}
          for personalized recommendations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="w-full sm:w-64">
          <Select
            placeholder="All specialties"
            options={[
              { value: '', label: 'All specialties' },
              ...specializations.map((s) => ({ value: s.id, label: s.name })),
            ]}
            value={specializationId}
            onChange={(e) => updateParam('specializationId', e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(e) => updateParam('sortBy', e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => navigate(`/doctors/${doctor.id}`)}
              className="cursor-pointer"
            >
              <DoctorCard doctor={doctor} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-100 bg-paper-0 p-12 text-center flex flex-col items-center gap-3">
          <Search className="h-8 w-8 text-slate-300" />
          <p className="text-slate-500">No doctors match these filters yet.</p>
        </div>
      )}
    </div>
  );
}
