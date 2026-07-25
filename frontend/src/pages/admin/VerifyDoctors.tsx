import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X, GraduationCap, BadgeCheck } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as adminDashboardService from '@/services/adminDashboard.service';

export default function AdminVerifyDoctorsPage() {
  useSetPageTitle('Verify Doctors');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'doctors', 'pending'],
    queryFn: () => adminDashboardService.fetchDoctors({ status: 'PENDING' }, 1, 50),
  });

  const verifyMutation = useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason: reason,
    }: {
      id: string;
      status: 'VERIFIED' | 'REJECTED';
      rejectionReason?: string;
    }) => adminDashboardService.verifyDoctor(id, status, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-summary'] });
      showToast(
        variables.status === 'VERIFIED' ? 'Doctor approved and now live.' : 'Doctor application declined.',
        'success'
      );
      setRejectTarget(null);
      setRejectionReason('');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for the rejection.', 'error');
      return;
    }
    if (rejectTarget) {
      verifyMutation.mutate({ id: rejectTarget, status: 'REJECTED', rejectionReason });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center flex flex-col items-center gap-3">
        <BadgeCheck className="h-10 w-10 text-success-600" />
        <p className="text-slate-500">No pending doctor applications right now.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.items.map((doctor) => (
        <div
          key={doctor.id}
          className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="h-14 w-14 rounded-full bg-teal-100 text-teal-700 font-display text-lg flex items-center justify-center shrink-0">
            {doctor.firstName[0]}
            {doctor.lastName[0]}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display text-base text-slate-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </p>
            <p className="text-sm text-slate-500 mb-2">
              {doctor.specialization.name} · {doctor.user.email}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {doctor.qualification}
              </span>
              <span>{doctor.experienceYears} yrs experience</span>
              <span className="font-mono text-xs bg-ivory-100 px-2 py-0.5 rounded">
                License: {doctor.licenseNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="w-auto"
              isLoading={verifyMutation.isPending}
              onClick={() => verifyMutation.mutate({ id: doctor.id, status: 'VERIFIED' })}
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-auto"
              onClick={() => setRejectTarget(doctor.id)}
            >
              <X className="h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      ))}

      <Dialog
        open={Boolean(rejectTarget)}
        onClose={() => {
          setRejectTarget(null);
          setRejectionReason('');
        }}
        title="Reject application"
      >
        <p className="text-sm text-slate-500 mb-4">
          This reason will be shared with the applicant by notification.
        </p>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={3}
          placeholder="e.g. License number could not be verified"
          className="w-full rounded-lg border border-slate-300 bg-paper-0 px-3.5 py-2.5 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-auto"
            onClick={() => {
              setRejectTarget(null);
              setRejectionReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-auto"
            isLoading={verifyMutation.isPending}
            onClick={handleReject}
          >
            Confirm rejection
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
