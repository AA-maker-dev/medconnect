import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Star,
  MapPin,
  Briefcase,
  BadgeCheck,
  Award,
  Languages,
  CalendarDays,
  Video,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/shared/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as doctorService from '@/services/doctor.service';
import * as appointmentService from '@/services/appointment.service';
import { cn } from '@/utils/cn';
import type { ConsultationType } from '@/types/appointment.types';

function nextNDays(n: number) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const dateOptions = useMemo(() => nextNDays(14), []);
  const [selectedDate, setSelectedDate] = useState(toDateKey(dateOptions[0]));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('IN_PERSON');
  const [reasonForVisit, setReasonForVisit] = useState('');

  const { data: doctor, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor-detail', id],
    queryFn: () => doctorService.getDoctorById(id!),
    enabled: Boolean(id),
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['doctor-slots', id, selectedDate],
    queryFn: () => appointmentService.fetchAvailableSlots(id!, selectedDate),
    enabled: Boolean(id),
  });

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  const bookMutation = useMutation({
    mutationFn: () =>
      appointmentService.bookAppointment({
        doctorId: id!,
        date: selectedDate,
        startTime: selectedSlot!,
        endTime: slots!.find((s) => s.startTime === selectedSlot)!.endTime,
        consultationType,
        reasonForVisit: reasonForVisit || undefined,
      }),
    onSuccess: (appointment) => {
      showToast('Appointment requested! Waiting on the doctor to confirm.', 'success');
      navigate(`/appointments/${appointment.id}/confirmation`);
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/doctors/${id}` } } });
      return;
    }
    if (user?.role !== 'PATIENT') {
      showToast('Only patient accounts can book appointments.', 'error');
      return;
    }
    if (!selectedSlot) {
      showToast('Please select a time slot.', 'error');
      return;
    }
    bookMutation.mutate();
  };

  if (doctorLoading) {
    return (
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
        <Skeleton className="h-40 w-full rounded-lg mb-6" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-20 text-center text-slate-500">
        Doctor not found.
      </div>
    );
  }

  const rating = Number(doctor.ratingAvg);
  const fee = Number(doctor.consultationFee);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <div className="rounded-xl border border-slate-100 bg-paper-0 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {doctor.avatarUrl ? (
            <img
              src={doctor.avatarUrl}
              alt={doctor.firstName}
              className="h-24 w-24 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-teal-100 text-teal-700 font-display text-2xl flex items-center justify-center shrink-0">
              {initials(doctor.firstName, doctor.lastName)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-display text-2xl text-slate-900">
                Dr. {doctor.firstName} {doctor.lastName}
              </h1>
              <BadgeCheck className="h-5 w-5 text-teal-600" aria-label="Verified" />
            </div>
            <p className="text-slate-500 mb-3">
              {doctor.specialization.name} · {doctor.qualification}
            </p>

            <div className="flex items-center gap-5 text-sm text-slate-600 flex-wrap mb-3">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                {rating.toFixed(1)} <span className="text-slate-400">({doctor.ratingCount})</span>
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" /> {doctor.experienceYears} yrs experience
              </span>
              {doctor.hospital && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> {doctor.hospital.name}, {doctor.hospital.city}
                </span>
              )}
              {doctor.languages.length > 0 && (
                <span className="flex items-center gap-1">
                  <Languages className="h-4 w-4" /> {doctor.languages.join(', ')}
                </span>
              )}
            </div>

            <p className="font-display text-xl text-teal-900">
              NPR {fee.toLocaleString()}{' '}
              <span className="text-sm font-body text-slate-500">consultation fee</span>
            </p>
          </div>
        </div>

        {doctor.bio && (
          <p className="text-sm text-slate-600 leading-relaxed mt-6 pt-6 border-t border-slate-100">
            {doctor.bio}
          </p>
        )}

        {doctor.awards && doctor.awards.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Awards
            </p>
            <div className="flex flex-col gap-1.5">
              {doctor.awards.map((award) => (
                <span key={award.id} className="flex items-center gap-2 text-sm text-slate-600">
                  <Award className="h-4 w-4 text-amber-600" />
                  {award.title} {award.year ? `(${award.year})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-100 bg-paper-0 shadow-sm p-6 sm:p-8">
        <h2 className="font-display text-xl text-slate-900 mb-6 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-teal-700" /> Book an appointment
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {dateOptions.map((d) => {
            const key = toDateKey(d);
            const isSelected = key === selectedDate;
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(key)}
                className={cn(
                  'flex flex-col items-center justify-center rounded-lg border px-4 py-2.5 min-w-[64px] shrink-0 transition-colors duration-fast',
                  isSelected
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-teal-500'
                )}
              >
                <span className="text-xs uppercase">
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <span className="text-base font-semibold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        {slotsLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-md" />
            ))}
          </div>
        ) : slots && slots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
            {slots.map((slot) => (
              <button
                key={slot.startTime}
                onClick={() => setSelectedSlot(slot.startTime)}
                className={cn(
                  'rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-fast',
                  selectedSlot === slot.startTime
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : 'border-slate-300 text-slate-700 hover:border-teal-500'
                )}
              >
                {slot.startTime}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 mb-6">
            No open slots on this day — try another date.
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Select
            label="Consultation type"
            options={[
              { value: 'IN_PERSON', label: 'In-person' },
              { value: 'VIDEO', label: 'Video call' },
            ]}
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
          />
        </div>

        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-sm font-medium text-slate-700 font-body">
            Reason for visit (optional)
          </label>
          <textarea
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            rows={2}
            placeholder="Briefly describe what's going on..."
            className="w-full rounded-lg border border-slate-300 bg-paper-0 px-3.5 py-2.5 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <Button
          onClick={handleBook}
          isLoading={bookMutation.isPending}
          disabled={!selectedSlot}
          className="w-auto"
        >
          {consultationType === 'VIDEO' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
          {isAuthenticated ? 'Confirm booking' : 'Log in to book'}
        </Button>
      </div>
    </div>
  );
}
