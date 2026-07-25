import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Pagination } from '@/components/shared/Pagination';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import { cn } from '@/utils/cn';
import * as adminDashboardService from '@/services/adminDashboard.service';

const VISIBILITY_OPTIONS = [
  { value: '', label: 'All reviews' },
  { value: 'true', label: 'Visible only' },
  { value: 'false', label: 'Hidden only' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminReviewsPage() {
  useSetPageTitle('Manage Reviews');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', visible, page],
    queryFn: () =>
      adminDashboardService.fetchReviews(
        { visible: visible === '' ? undefined : visible === 'true' },
        page,
        10
      ),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      adminDashboardService.setReviewVisibility(id, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      showToast('Review visibility updated.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDashboardService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      showToast('Review deleted.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full sm:w-56">
        <Select
          options={VISIBILITY_OPTIONS}
          value={visible}
          onChange={(e) => {
            setVisible(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : data && data.items.length > 0 ? (
          data.items.map((review) => (
            <div
              key={review.id}
              className={cn(
                'rounded-lg border p-5 shadow-sm',
                review.isVisible ? 'border-slate-100 bg-paper-0' : 'border-slate-200 bg-ivory-100'
              )}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {review.patient.firstName} {review.patient.lastName}{' '}
                    <span className="text-slate-400 font-normal">reviewed</span> Dr.{' '}
                    {review.doctor.firstName} {review.doctor.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < review.rating ? 'text-amber-600 fill-amber-600' : 'text-slate-300'
                        )}
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-2">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      toggleVisibilityMutation.mutate({ id: review.id, isVisible: !review.isVisible })
                    }
                    className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:bg-ivory-100 hover:text-teal-700 transition-colors duration-fast"
                    aria-label={review.isVisible ? 'Hide review' : 'Show review'}
                    title={review.isVisible ? 'Hide from public' : 'Make visible'}
                  >
                    {review.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(review.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:bg-danger-100 hover:text-danger-600 transition-colors duration-fast"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {review.comment && <p className="text-sm text-slate-600">"{review.comment}"</p>}
              {!review.isVisible && (
                <span className="inline-block mt-2 text-xs font-semibold uppercase text-slate-400">
                  Hidden from public
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center text-slate-500">
            No reviews found.
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="rounded-lg border border-slate-100 bg-paper-0">
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
