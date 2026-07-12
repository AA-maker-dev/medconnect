import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as patientService from '@/services/patient.service';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  chronicConditions: string;
}

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

export default function PatientProfilePage() {
  useSetPageTitle('Profile');
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['patient', 'profile'],
    queryFn: patientService.fetchProfile,
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<ProfileFormValues>();

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
        gender: profile.gender ?? '',
        bloodGroup: profile.bloodGroup ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        emergencyContactName: profile.emergencyContactName ?? '',
        emergencyContactPhone: profile.emergencyContactPhone ?? '',
        allergies: profile.allergies ?? '',
        chronicConditions: profile.chronicConditions ?? '',
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => patientService.updateProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'profile'] });
      showToast('Profile updated.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {profile && (
        <div className="mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-teal-100 text-teal-700 font-display text-xl flex items-center justify-center">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div>
            <p className="font-display text-lg text-slate-900">
              {profile.firstName} {profile.lastName}
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

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Date of birth" type="date" {...register('dateOfBirth')} />
          <Select label="Gender" options={GENDER_OPTIONS} {...register('gender')} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Blood group" placeholder="e.g. O+" {...register('bloodGroup')} />
          <Input label="City" {...register('city')} />
        </div>

        <Input label="Address" {...register('address')} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Emergency contact name" {...register('emergencyContactName')} />
          <Input
            label="Emergency contact phone"
            placeholder="+977 98XXXXXXXX"
            {...register('emergencyContactPhone')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 font-body">
            Allergies (optional)
          </label>
          <textarea
            rows={2}
            {...register('allergies')}
            className="w-full rounded-md border border-slate-300 bg-paper-0 px-3.5 py-2.5 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 font-body">
            Chronic conditions (optional)
          </label>
          <textarea
            rows={2}
            {...register('chronicConditions')}
            className="w-full rounded-md border border-slate-300 bg-paper-0 px-3.5 py-2.5 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <Button type="submit" isLoading={isSubmitting || updateMutation.isPending} className="w-auto self-start">
          Save changes
        </Button>
      </form>
    </div>
  );
}
