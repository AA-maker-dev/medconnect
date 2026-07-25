import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';
import { extractErrorMessage } from '@/services/api';
import { loginFormSchema, type LoginFormValues } from '@/utils/authSchemas';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await adminLogin(values);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Unable to log in.'));
    }
  };

  return (
    <AuthLayout
      title="Admin sign in"
      subtitle="Restricted access — MedConnect staff only."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex items-center gap-2 text-teal-700 mb-1 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2.5">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Administrator access
          </span>
        </div>

        {serverError && <Alert variant="error">{serverError}</Alert>}

        <Input
          label="Admin email"
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" isLoading={isSubmitting} variant="secondary">
          Sign in as admin
        </Button>
      </form>
    </AuthLayout>
  );
}
