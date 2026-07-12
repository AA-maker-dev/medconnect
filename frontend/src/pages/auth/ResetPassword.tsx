import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { extractErrorMessage } from '@/services/api';
import * as authService from '@/services/auth.service';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '@/utils/authSchemas';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  if (!token) {
    return (
      <AuthLayout title="Reset your password" subtitle="This link looks invalid.">
        <Alert variant="error">
          The reset link is missing its token. Please request a new one.
        </Alert>
        <Link
          to="/forgot-password"
          className="block mt-4 text-teal-700 font-semibold hover:underline"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await authService.resetPassword(token, values.newPassword, values.confirmPassword);
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset. Please log in with your new password.' },
      });
    } catch (err) {
      setServerError(
        extractErrorMessage(err, 'This link may have expired. Please request a new one.')
      );
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Make it something you'll remember.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <PasswordInput
          label="New password"
          autoComplete="new-password"
          hint="At least 8 characters, with uppercase, lowercase, and a number."
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
