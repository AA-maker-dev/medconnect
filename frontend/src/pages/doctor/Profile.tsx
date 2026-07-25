import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Star, BadgeCheck } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as doctorDashboardService from '@/services/doctorDashboard.service';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  bio: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  location: string;
}

export default function DoctorProfilePage() {
  useSetPageTitle('Profile');
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['doctor', 'profile'],
    queryFn: doctorDashboardService.fetchProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>();

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio ?? '',
        qualification: profile.qualification,
        experienceYears: profile.experienceYears,
        consultationFee: Number(profile.consultationFee),
        location: profile.location ?? '',
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      doctorDashboardService.updateProfile({
        ...values,
        consultationFee: String(values.consultationFee),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'profile'] });
      showToast('Profile updated.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {profile && (
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <div className="h-16 w-16 rounded-full bg-teal-100 text-teal-700 font-display text-xl flex items-center justify-center">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div>
            <p className="font-display text-lg text-slate-900 flex items-center gap-1.5">
              Dr. {profile.firstName} {profile.lastName}
              <BadgeCheck className="h-4 w-4 text-teal-600" />
            </p>
            <p className="text-sm text-slate-500">
              {profile.specialization.name} · {profile.user.email}
            </p>
            <p className="flex items-center gap-1 text-sm text-slate-500 mt-1">
              <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
              {Number(profile.ratingAvg).toFixed(1)} ({profile.ratingCount} reviews)
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
        className="flex flex-col gap-5"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="First name" {...register('firstName')} />
          <Input label="Last name" {...register('lastName')} />
        </div>

        <Input label="Qualification" {...register('qualification')} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Years of experience"
            type="number"
            min={0}
            {...register('experienceYears')}
          />
          <Input
            label="Consultation fee (NPR)"
            type="number"
            min={0}
            {...register('consultationFee')}
          />
        </div>

        <Input label="Location" placeholder="e.g. Kathmandu, Nepal" {...register('location')} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 font-body">Bio</label>
          <textarea
            rows={4}
            {...register('bio')}
            className="w-full rounded-lg border border-slate-300 bg-paper-0 px-3.5 py-2.5 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Tell patients about your practice and approach to care..."
          />
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting || updateMutation.isPending}
          className="w-auto self-start"
        >
          Save changes
        </Button>
      </form>
    </div>
  );
}
