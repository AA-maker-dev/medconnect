import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { dashboardPathForRole } from '@/components/shared/ProtectedRoute';
import { extractErrorMessage } from '@/services/api';
import { loginFormSchema, type LoginFormValues } from '@/utils/authSchemas';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const locationState = location.state as { message?: string } | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login(values);
      const redirectTo =
        (location.state as { from?: Location })?.from?.pathname ??
        dashboardPathForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Unable to log in. Please try again.'));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your appointments and messages."
      footer={
        <span className="text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-700 font-semibold hover:underline">
            Create one
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {locationState?.message && <Alert variant="success">{locationState.message}</Alert>}
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" {...register('rememberMe')} />
          <Link
            to="/forgot-password"
            className="text-sm text-teal-700 font-semibold hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Log in
        </Button>

        <p className="text-center text-xs text-slate-500 mt-2">
          Are you an administrator?{' '}
          <Link to="/admin/login" className="text-teal-700 hover:underline">
            Admin login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
