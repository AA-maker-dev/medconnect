import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CalendarClock, MapPin, Video, Clock3, CreditCard, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { PaymentModal } from '@/components/payment/PaymentModal';
import * as appointmentService from '../../services/appointment.service';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentService.fetchAppointmentById(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-16">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-20 text-center text-slate-500">
        Appointment not found.
      </div>
    );
  }

  const isPaid = (appointment as any).payment?.status === 'SUCCESS';
  const doctorFullName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
  const fee = Number(appointment.doctor.consultationFee);

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-16">
      <div className="rounded-xl border border-slate-100 bg-paper-0 shadow-sm p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-success-100 text-success-600 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl text-slate-900 mb-2">Appointment requested</h1>
        <p className="text-slate-500 mb-8">
          Dr. {doctorFullName} will review your request. You'll get a notification the moment it's approved.
        </p>

        <div className="rounded-lg bg-ivory-100 p-5 text-left flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-teal-700 shrink-0" />
            <span className="text-sm text-slate-700">{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-teal-700 shrink-0" />
            <span className="text-sm text-slate-700">
              {appointment.startTime} – {appointment.endTime}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {appointment.consultationType === 'VIDEO' ? (
              <Video className="h-5 w-5 text-teal-700 shrink-0" />
            ) : (
              <MapPin className="h-5 w-5 text-teal-700 shrink-0" />
            )}
            <span className="text-sm text-slate-700">
              {appointment.consultationType === 'VIDEO'
                ? 'Video consultation'
                : appointment.doctor.hospital?.name ?? 'In-person visit'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full w-fit">
              {appointment.status}
            </span>
            <div className="text-right">
              <span className="text-sm font-semibold text-slate-900 block">
                NPR {fee.toLocaleString()}
              </span>
              {isPaid ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center justify-end gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Paid
                </span>
              ) : (
                <span className="text-xs text-amber-600 font-medium block">Payment Pending</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isPaid && (
            <Button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" /> Pay Consultation Fee (eSewa / FonePay / Wallet)
            </Button>
          )}
          <Link to="/patient/appointments" className="w-full sm:w-auto">
            <Button variant={isPaid ? 'primary' : 'outline'} className="w-full">
              View my appointments
            </Button>
          </Link>
        </div>
      </div>

      {appointment && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          appointmentId={appointment.id}
          doctorName={doctorFullName}
          consultationFee={fee}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['appointment', id] })}
        />
      )}
    </div>
  );
}
