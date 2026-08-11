import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as patientService from '@/services/patient.service';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    doctorId: string;
    doctor: { firstName: string; lastName: string; specialization: { name: string } };
  };
  onSuccess: () => void;
}

export function ReviewModal({ open, onClose, appointment, onSuccess }: ReviewModalProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      patientService.createReview({
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      showToast('Review submitted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['patient', 'appointments'] });
      onSuccess();
      onClose();
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const handleSubmit = () => {
    createMutation.mutate();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-paper-0 rounded-xl shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-display text-lg text-slate-900">Leave a Review</h3>
            <p className="text-sm text-slate-500">
              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName} · {appointment.doctor.specialization.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform duration-fast hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-500">{rating}/5</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this doctor..."
              className="w-full rounded-lg border border-slate-300 bg-paper-0 px-4 py-3 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={createMutation.isPending}
              className="w-auto"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
