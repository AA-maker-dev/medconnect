import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { extractErrorMessage } from '@/services/api';
import * as authService from '@/services/auth.service';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '@/utils/authSchemas';

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Something went wrong. Please try again.'));
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
      footer={
        <Link to="/login" className="text-teal-700 font-semibold hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <Alert variant="success">
          If an account exists with that email, a reset link is on its way. It expires in
          30 minutes.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
