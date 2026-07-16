import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, User } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { extractErrorMessage } from '@/services/api';
import * as authService from '@/services/auth.service';
import {
  registerPatientFormSchema,
  type RegisterPatientFormValues,
} from '@/utils/authSchemas';

export default function RegisterPatientPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPatientFormValues>({
    resolver: zodResolver(registerPatientFormSchema),
  });

  const onSubmit = async (values: RegisterPatientFormValues) => {
    setServerError(null);
    try {
      await authService.registerPatient(values);
      navigate('/verify-otp', { state: { email: values.email }, replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };

  return (
    <AuthLayout
      title="Create your patient account"
      subtitle="Takes about a minute. You'll verify your email next."
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
          autoComplete="tel"
          placeholder="+977 98XXXXXXXX"
          icon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <PasswordInput
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters, with uppercase, lowercase, and a number."
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
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
