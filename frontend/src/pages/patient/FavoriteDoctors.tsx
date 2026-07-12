import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HeartCrack, Star } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as patientService from '@/services/patient.service';

export default function FavoriteDoctorsPage() {
  useSetPageTitle('Favorite Doctors');
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['patient', 'favorite-doctors'],
    queryFn: patientService.fetchFavoriteDoctors,
  });

  const removeMutation = useMutation({
    mutationFn: (doctorId: string) => patientService.removeFavoriteDoctor(doctorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'favorite-doctors'] });
      showToast('Removed from favorites.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center">
        <p className="text-slate-500 mb-4">
          You haven't saved any favorite doctors yet. Save doctors you'd like to book with
          again for quick access.
        </p>
        <Link to="/doctors">
          <Button size="sm" className="w-auto">
            Browse doctors
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {favorites.map((fav) => (
        <div
          key={fav.id}
          className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-700 font-display flex items-center justify-center shrink-0">
              {fav.doctor.firstName[0]}
              {fav.doctor.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-display text-base text-slate-900 truncate">
                Dr. {fav.doctor.firstName} {fav.doctor.lastName}
              </p>
              <p className="text-sm text-slate-500 truncate">{fav.doctor.specialization.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-slate-700 mb-4">
            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
            {Number(fav.doctor.ratingAvg).toFixed(1)}{' '}
            <span className="text-slate-500">({fav.doctor.ratingCount})</span>
          </div>

          <div className="mt-auto flex items-center gap-2">
            <Button size="sm" className="flex-1">
              Book again
            </Button>
            <button
              onClick={() => removeMutation.mutate(fav.doctor.id)}
              aria-label="Remove from favorites"
              className="h-9 w-9 flex items-center justify-center rounded-md text-slate-400 hover:text-danger-600 hover:bg-danger-100 transition-colors duration-fast shrink-0"
            >
              <HeartCrack className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
