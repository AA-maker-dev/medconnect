import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Sparkles, Star, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import * as appointmentService from '@/services/appointment.service';
import type { Disease } from '@/types/appointment.types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(
    searchParams.get('diseaseId')
  );

  const { data: diseases, isLoading: diseasesLoading } = useQuery({
    queryKey: ['diseases'],
    queryFn: appointmentService.fetchDiseases,
  });

  // If the URL arrived with a text query (e.g. from the hero search bar),
  // try to auto-match it to a disease by name once diseases have loaded.
  useEffect(() => {
    if (!diseases || selectedDiseaseId || !initialQuery.trim()) return;
    const match = diseases.find(
      (d) => d.name.toLowerCase() === initialQuery.trim().toLowerCase()
    );
    if (match) setSelectedDiseaseId(match.id);
  }, [diseases, initialQuery, selectedDiseaseId]);

  const filteredDiseases = useMemo(() => {
    if (!diseases) return [];
    if (!query.trim()) return diseases;
    const q = query.trim().toLowerCase();
    return diseases.filter(
      (d) => d.name.toLowerCase().includes(q) || d.specialization.name.toLowerCase().includes(q)
    );
  }, [diseases, query]);

  const { data: recommendation, isLoading: recommendationLoading } = useQuery({
    queryKey: ['recommended-doctors', selectedDiseaseId],
    queryFn: () => appointmentService.fetchRecommendedDoctors(selectedDiseaseId!, 10),
    enabled: Boolean(selectedDiseaseId),
  });

  const handleSelectDisease = (disease: Disease) => {
    setSelectedDiseaseId(disease.id);
    const next = new URLSearchParams();
    next.set('diseaseId', disease.id);
    setSearchParams(next);
  };

  const handleReset = () => {
    setSelectedDiseaseId(null);
    setQuery('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="mx-auto max-w-4xl px-5 sm:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
          What's going on?
        </h1>
        <p className="text-slate-500 font-body max-w-lg mx-auto">
          Tell us what you're dealing with and we'll recommend the right specialists —
          ranked by rating, experience, and your own appointment history.
        </p>
      </div>

      {!selectedDiseaseId ? (
        <>
          <div className="relative max-w-lg mx-auto mb-8">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Heart Disease, Migraine, Tooth Decay..."
              autoFocus
              className="w-full rounded-lg border border-slate-300 bg-paper-0 pl-12 pr-4 text-base font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              style={{ height: '3.25rem' }}
            />
          </div>

          {diseasesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : filteredDiseases.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDiseases.map((disease, i) => (
                <motion.button
                  key={disease.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => handleSelectDisease(disease)}
                  className="text-left rounded-lg border border-slate-100 bg-paper-0 p-4 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all duration-base"
                >
                  <p className="font-medium text-slate-900">{disease.name}</p>
                  <p className="text-xs text-slate-500">{disease.specialization.name}</p>
                </motion.button>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400">No matching conditions found.</p>
          )}
        </>
      ) : (
        <div>
          <button
            onClick={handleReset}
            className="text-sm text-teal-700 font-semibold hover:underline mb-6"
          >
            ← Search something else
          </button>

          {recommendationLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : recommendation && recommendation.doctors.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-coral-600" />
                <h2 className="font-display text-xl text-slate-900">
                  Recommended {recommendation.specialization.name}s for you
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {recommendation.doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => navigate(`/doctors/${doctor.id}`)}
                    className="text-left rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm hover:shadow-md transition-shadow duration-base flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="h-14 w-14 rounded-full bg-teal-100 text-teal-700 font-display text-lg flex items-center justify-center shrink-0">
                      {doctor.firstName[0]}
                      {doctor.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-base text-slate-900">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </p>
                      <p className="text-sm text-slate-500 mb-2">{doctor.qualification}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                          {Number(doctor.ratingAvg).toFixed(1)} ({doctor.ratingCount})
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" /> {doctor.experienceYears} yrs
                        </span>
                      </div>
                      {doctor.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {doctor.matchReasons.map((reason) => (
                            <span
                              key={reason}
                              className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400 mb-1">Match score</p>
                      <p className="font-display text-2xl text-teal-700">{doctor.matchScore}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center">
              <p className="text-slate-500 mb-4">
                No verified {recommendation?.specialization.name.toLowerCase()}s available right
                now.
              </p>
              <Button size="sm" className="w-auto" onClick={() => navigate('/doctors')}>
                Browse all doctors
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
