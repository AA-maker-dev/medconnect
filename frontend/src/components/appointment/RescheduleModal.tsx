import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Video, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as appointmentService from '@/services/appointment.service';
import { cn } from '@/utils/cn';
import type { ConsultationType } from '@/types/appointment.types';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    doctorId: string;
    doctor: { firstName: string; lastName: string; specialization: { name: string } };
  };
  onSuccess: () => void;
}

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

export function RescheduleModal({ open, onClose, appointment, onSuccess }: RescheduleModalProps) {
  const { showToast } = useToast();
  const dateOptions = useState(() => nextNDays(14))[0];
  const [selectedDate, setSelectedDate] = useState(toDateKey(dateOptions[0]));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('IN_PERSON');
  const [reasonForVisit, setReasonForVisit] = useState('');

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['doctor-slots', appointment.doctorId, selectedDate],
    queryFn: () => appointmentService.fetchAvailableSlots(appointment.doctorId, selectedDate),
    enabled: open && Boolean(appointment.doctorId),
  });

  useEffect(() => {
    if (open) {
      setSelectedDate(toDateKey(dateOptions[0]));
      setSelectedSlot(null);
      setConsultationType('IN_PERSON');
      setReasonForVisit('');
    }
  }, [open, dateOptions]);

  const rescheduleMutation = useMutation({
    mutationFn: () =>
      appointmentService.rescheduleAppointment({
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        date: selectedDate,
        startTime: selectedSlot!,
        endTime: slots!.find((s) => s.startTime === selectedSlot)!.endTime,
        consultationType,
        reasonForVisit: reasonForVisit || undefined,
      }),
    onSuccess: () => {
      showToast('Appointment rescheduled successfully!', 'success');
      onSuccess();
      onClose();
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const handleReschedule = () => {
    if (!selectedSlot) {
      showToast('Please select a time slot.', 'error');
      return;
    }
    rescheduleMutation.mutate();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-paper-0 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-display text-lg text-slate-900">Reschedule Appointment</h3>
            <p className="text-sm text-slate-500">
              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName} · {appointment.doctor.specialization.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
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
            <select
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
              className="w-full rounded-md border border-slate-300 bg-paper-0 px-4 py-2.5 text-base font-body text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="IN_PERSON">In-person</option>
              <option value="VIDEO">Video call</option>
            </select>
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

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              isLoading={rescheduleMutation.isPending}
              disabled={!selectedSlot}
              className="w-auto"
            >
              {consultationType === 'VIDEO' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              Reschedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
