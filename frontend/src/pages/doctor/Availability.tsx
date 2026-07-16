import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as doctorDashboardService from '@/services/doctorDashboard.service';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_OPTIONS = DAYS.map((label, value) => ({ value: String(value), label }));

const TIME_OPTIONS = Array.from({ length: 24 }).map((_, h) => {
  const hh = String(h).padStart(2, '0');
  return { value: `${hh}:00`, label: `${hh}:00` };
});

export default function DoctorAvailabilityPage() {
  useSetPageTitle('Availability Schedule');
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const { data: slots, isLoading } = useQuery({
    queryKey: ['doctor', 'availability'],
    queryFn: doctorDashboardService.fetchAvailability,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      doctorDashboardService.addAvailabilitySlot({
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'availability'] });
      setFormOpen(false);
      showToast('Availability slot added.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctorDashboardService.deleteAvailabilitySlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'availability'] });
      showToast('Slot removed.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const grouped = DAYS.map((label, dayIndex) => ({
    label,
    dayIndex,
    slots: (slots ?? []).filter((s) => s.dayOfWeek === dayIndex),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-slate-500 font-body max-w-lg">
          Patients can only book within the windows you set here. Add a slot for each day
          you're available.
        </p>
        <Button size="sm" className="w-auto" onClick={() => setFormOpen((v) => !v)}>
          <Plus className="h-4 w-4" /> Add slot
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (startTime >= endTime) {
              showToast('Start time must be before end time.', 'error');
              return;
            }
            addMutation.mutate();
          }}
          className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm grid sm:grid-cols-3 gap-4 items-end"
        >
          <Select
            label="Day"
            options={DAY_OPTIONS}
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
          />
          <Select
            label="Start time"
            options={TIME_OPTIONS}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Select
            label="End time"
            options={TIME_OPTIONS}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <div className="sm:col-span-3">
            <Button type="submit" size="sm" className="w-auto" isLoading={addMutation.isPending}>
              Save slot
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {grouped.map((day) => (
            <div key={day.label} className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm">
              <p className="font-display text-base text-slate-900 mb-3">{day.label}</p>
              {day.slots.length === 0 ? (
                <p className="text-sm text-slate-400">Not available</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {day.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-md bg-ivory-100 px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm text-slate-700">
                        <Clock className="h-4 w-4 text-teal-700" />
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(slot.id)}
                        aria-label="Remove slot"
                        className="text-slate-400 hover:text-danger-600 transition-colors duration-fast"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
