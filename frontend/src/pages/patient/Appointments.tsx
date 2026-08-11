import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarClock, MapPin, Video, FileText, Star, CreditCard, ShieldCheck, RefreshCw } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { RescheduleModal } from '@/components/appointment/RescheduleModal';
import { cn } from '@/utils/cn';
import * as patientService from '@/services/patient.service';
import type { AppointmentStatus } from '@/types/patient.types';

type Tab = 'upcoming' | 'past';

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-600',
  APPROVED: 'bg-success-100 text-success-600',
  RESCHEDULED: 'bg-amber-100 text-amber-600',
  COMPLETED: 'bg-teal-100 text-teal-700',
  REJECTED: 'bg-danger-100 text-danger-600',
  CANCELLED: 'bg-slate-100 text-slate-500',
  NO_SHOW: 'bg-danger-100 text-danger-600',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PatientAppointmentsPage() {
  useSetPageTitle('Appointments');
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [activeApptForPayment, setActiveApptForPayment] = useState<any>(null);
  const [activeApptForReschedule, setActiveApptForReschedule] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patient', 'appointments', tab],
    queryFn: () => patientService.fetchAppointments(tab, 1, 20),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-100">
        {(['upcoming', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-3 text-sm font-semibold font-body capitalize border-b-2 -mb-px transition-colors duration-fast',
              tab === t
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {t} appointments
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))
        ) : data && data.items.length > 0 ? (
          data.items.map((appt: any) => {
            const isPaid = appt.payment?.status === 'SUCCESS';
            const fee = Number(appt.doctor.consultationFee ?? 0);

            return (
              <div
                key={appt.id}
                className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="h-14 w-14 rounded-full bg-teal-100 text-teal-700 font-display text-lg flex items-center justify-center shrink-0">
                  {appt.doctor.firstName[0]}
                  {appt.doctor.lastName[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-display text-base text-slate-900">
                      Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                    </p>
                    <span
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                        STATUS_STYLES[appt.status as AppointmentStatus]
                      )}
                    >
                      {appt.status}
                    </span>
                    {isPaid ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> Paid
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Unpaid (NPR {fee.toLocaleString()})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{appt.doctor.specialization.name}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-4 w-4" />
                      {formatDate(appt.date)}, {appt.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      {appt.consultationType === 'VIDEO' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      {appt.consultationType === 'VIDEO'
                        ? 'Video call'
                        : appt.doctor.hospital?.name ?? 'In-person'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {!isPaid && appt.status !== 'CANCELLED' && appt.status !== 'REJECTED' && (
                    <Button
                      size="sm"
                      onClick={() => setActiveApptForPayment(appt)}
                      className="w-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                    >
                      <CreditCard className="h-4 w-4" /> Pay Now
                    </Button>
                  )}
                  {tab === 'upcoming' && appt.consultationType === 'VIDEO' && (
                    <Button size="sm" variant="outline" className="w-auto">
                      <Video className="h-4 w-4" /> Join
                    </Button>
                  )}
                  {tab === 'past' && appt.prescription && (
                    <Button variant="outline" size="sm" className="w-auto">
                      <FileText className="h-4 w-4" /> Prescription
                    </Button>
                  )}
                  {tab === 'past' && appt.status === 'COMPLETED' && !appt.review && (
                    <Button variant="ghost" size="sm" className="w-auto">
                      <Star className="h-4 w-4" /> Leave review
                    </Button>
                  )}
                  {tab === 'past' && appt.status === 'COMPLETED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-auto"
                      onClick={() =>
                        setActiveApptForReschedule({
                          ...appt,
                          doctorId: appt.doctor.id,
                        })
                      }
                    >
                      <RefreshCw className="h-4 w-4" /> Reschedule
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center">
            <p className="text-slate-500 mb-4">
              {tab === 'upcoming'
                ? "You don't have any upcoming appointments."
                : "You don't have any past appointments yet."}
            </p>
            <Link to="/doctors">
              <Button size="sm" className="w-auto">
                Find a doctor
              </Button>
            </Link>
          </div>
        )}
      </div>

      {activeApptForPayment && (
        <PaymentModal
          open={Boolean(activeApptForPayment)}
          onClose={() => setActiveApptForPayment(null)}
          appointmentId={activeApptForPayment.id}
          doctorName={`${activeApptForPayment.doctor.firstName} ${activeApptForPayment.doctor.lastName}`}
          consultationFee={Number(activeApptForPayment.doctor.consultationFee)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['patient', 'appointments'] });
            queryClient.invalidateQueries({ queryKey: ['patient', 'invoices'] });
          }}
        />
      )}

      {activeApptForReschedule && (
        <RescheduleModal
          open={Boolean(activeApptForReschedule)}
          onClose={() => setActiveApptForReschedule(null)}
          appointment={{
            id: activeApptForReschedule.id,
            doctorId: activeApptForReschedule.doctorId,
            doctor: {
              firstName: activeApptForReschedule.doctor.firstName,
              lastName: activeApptForReschedule.doctor.lastName,
              specialization: activeApptForReschedule.doctor.specialization,
            },
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['patient', 'appointments'] });
          }}
        />
      )}
    </div>
  );
}
