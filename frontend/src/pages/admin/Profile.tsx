import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as adminDashboardService from '@/services/adminDashboard.service';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
}

export default function AdminProfilePage() {
  useSetPageTitle('Profile');
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: adminDashboardService.fetchProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>();

  useEffect(() => {
    if (profile) {
      reset({ firstName: profile.firstName, lastName: profile.lastName });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => adminDashboardService.updateProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
      showToast('Profile updated.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  if (isLoading) {
    return (
      <div className="max-w-xl flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {profile && (
        <div className="mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-teal-100 text-teal-700 font-display text-xl flex items-center justify-center">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div>
            <p className="font-display text-lg text-slate-900 flex items-center gap-1.5">
              {profile.firstName} {profile.lastName}
              <ShieldCheck className="h-4 w-4 text-teal-600" />
            </p>
            <p className="text-sm text-slate-500">{profile.user.email}</p>
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
