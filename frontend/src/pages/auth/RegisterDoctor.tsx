import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, User, GraduationCap, BadgeCheck } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { extractErrorMessage } from '@/services/api';
import * as authService from '@/services/auth.service';
import { fetchSpecializations } from '@/services/public.service';
import {
  registerDoctorFormSchema,
  type RegisterDoctorFormValues,
} from '@/utils/authSchemas';

export default function RegisterDoctorPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<SelectOption[]>([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(true);

  useEffect(() => {
    fetchSpecializations()
      .then((list) => setSpecializations(list.map((s) => ({ value: s.id, label: s.name }))))
      .catch(() => setSpecializations([]))
      .finally(() => setLoadingSpecializations(false));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterDoctorFormValues>({
    resolver: zodResolver(registerDoctorFormSchema),
  });

  const onSubmit = async (values: RegisterDoctorFormValues) => {
    setServerError(null);
    try {
      await authService.registerDoctor(values);
      navigate('/verify-otp', {
        state: { email: values.email, isDoctor: true },
        replace: true,
      });
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  return (
    <AuthLayout
      title="Join as a doctor"
      subtitle="Your profile goes live after admin verifies your license."
      footer={
        <span className="text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-700 font-semibold hover:underline">
            Log in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            autoComplete="given-name"
            icon={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            icon={<User className="h-4 w-4" />}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone number (optional)"
          type="tel"
          placeholder="+977 98XXXXXXXX"
          icon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Select
          label="Specialization"
          placeholder={loadingSpecializations ? 'Loading...' : 'Select your specialization'}
          options={specializations}
          disabled={loadingSpecializations}
          error={errors.specializationId?.message}
          {...register('specializationId')}
        />

        <Input
          label="Qualification"
          placeholder="e.g. MBBS, MD (Cardiology)"
          icon={<GraduationCap className="h-4 w-4" />}
          error={errors.qualification?.message}
          {...register('qualification')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Years of experience"
            type="number"
            min={0}
            error={errors.experienceYears?.message}
            {...register('experienceYears')}
          />
          <Input
            label="Consultation fee (NPR)"
            type="number"
            min={0}
            error={errors.consultationFee?.message}
            {...register('consultationFee')}
          />
        </div>

        <Input
          label="Medical license number"
          icon={<BadgeCheck className="h-4 w-4" />}
          error={errors.licenseNumber?.message}
          hint="Verified by our admin team before your profile goes live."
          {...register('licenseNumber')}
        />

        <PasswordInput
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          {...register('agreeToTerms')}
        />
        {errors.agreeToTerms && (
          <p className="text-sm text-danger-600 -mt-2">{errors.agreeToTerms.message}</p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Submit application
        </Button>
      </form>
    </AuthLayout>
  );
}
