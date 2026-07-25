import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { extractErrorMessage } from '@/services/api';
import * as authService from '@/services/auth.service';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Needs an uppercase letter')
  .regex(/[a-z]/, 'Needs a lowercase letter')
  .regex(/[0-9]/, 'Needs a number');

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function AdminSettingsPage() {
  useSetPageTitle('Settings');
  const { showToast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (values: ChangePasswordValues) => {
    setServerError(null);
    try {
      await authService.changePassword(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword
      );
      reset();
      showToast('Password changed successfully.', 'success');
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Could not change password.'));
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true);
    try {
      await authService.logoutAllDevices();
      showToast('Logged out of all devices.', 'success');
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <section className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="h-5 w-5 text-teal-700" />
          <h3 className="font-display text-lg text-slate-900">Change password</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
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

          <Button type="submit" isLoading={isSubmitting} className="w-auto self-start">
            Update password
          </Button>
        </form>
      </section>

      <section className="rounded-lg border border-danger-600/20 bg-danger-100/40 p-6">
        <div className="flex items-center gap-2 mb-2">
          <LogOut className="h-5 w-5 text-danger-600" />
          <h3 className="font-display text-lg text-slate-900">Session management</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Signed in on a device that isn't yours anymore? Log out everywhere at once.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="w-auto"
          isLoading={isLoggingOutAll}
          onClick={handleLogoutAllDevices}
        >
          Log out of all devices
        </Button>
      </section>
    </div>
  );
}
