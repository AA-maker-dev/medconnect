import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { extractErrorMessage } from '@/services/api';
import * as authService from '@/services/auth.service';
import { otpFormSchema, type OtpFormValues } from '@/utils/authSchemas';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; isDoctor?: boolean } | null;
  const email = state?.email;

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({ resolver: zodResolver(otpFormSchema) });

  useEffect(() => {
    if (cooldown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  if (!email) {
    return (
      <AuthLayout title="Verify your email" subtitle="Missing context for this step.">
        <Alert variant="error">
          We couldn't find which email to verify. Please register or log in again.
        </Alert>
        <Link to="/register" className="block mt-4 text-teal-700 font-semibold hover:underline">
          Back to registration
        </Link>
      </AuthLayout>
    );
  }

  const onSubmit = async (values: OtpFormValues) => {
    setServerError(null);
    try {
      await authService.verifyOtp(email, values.otp);
      navigate('/login', {
        replace: true,
        state: {
          verified: true,
          message: state?.isDoctor
            ? 'Email verified. Your profile is pending admin approval — we\'ll email you once it\'s live.'
            : 'Email verified. You can now log in.',
        },
      });
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Invalid or expired code.'));
    }
  };

  const handleResend = async () => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await authService.resendOtp(email);
      setSuccessMessage('A new code has been sent to your email.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Could not resend code.'));
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${email}.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex items-center gap-2 text-teal-700 mb-1">
          <MailCheck className="h-5 w-5" />
          <span className="text-sm font-semibold">Check your inbox (and spam folder)</span>
        </div>

        {serverError && <Alert variant="error">{serverError}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <input
          maxLength={6}
          inputMode="numeric"
          placeholder="000000"
          autoFocus
          className="h-14 w-full rounded-md border border-slate-300 bg-paper-0 text-center text-2xl tracking-[0.5em] font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          {...register('otp')}
        />
        {errors.otp && <p className="text-sm text-danger-600 -mt-2">{errors.otp.message}</p>}

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Verify email
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-sm text-teal-700 font-semibold hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </form>
    </AuthLayout>
  );
}
