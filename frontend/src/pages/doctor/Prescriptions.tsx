import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pill, X, Trash2 } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { extractErrorMessage } from '@/services/api';
import * as doctorDashboardService from '@/services/doctorDashboard.service';

interface MedicineRow {
  name: string;
  dosage: string;
  frequency: string;
  durationDays: string;
}

const EMPTY_MEDICINE: MedicineRow = { name: '', dosage: '', frequency: '', durationDays: '' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function DoctorPrescriptionsPage() {
  useSetPageTitle('Prescription Management');
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([{ ...EMPTY_MEDICINE }]);

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['doctor', 'prescriptions'],
    queryFn: doctorDashboardService.fetchPrescriptions,
  });

  // Completed appointments without a prescription yet — the only valid targets.
  const { data: completedAppointments } = useQuery({
    queryKey: ['doctor', 'appointments', 'history-for-prescription'],
    queryFn: () => doctorDashboardService.fetchAppointments('history', 1, 50),
  });

  const eligibleAppointments = (completedAppointments?.items ?? []).filter(
    (a) => a.status === 'COMPLETED' && !a.prescription
  );

  const createMutation = useMutation({
    mutationFn: () =>
      doctorDashboardService.createPrescription({
        appointmentId,
        diagnosis,
        advice: advice || undefined,
        medicines: medicines
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            durationDays: m.durationDays ? Number(m.durationDays) : undefined,
          })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'appointments'] });
      setFormOpen(false);
      setAppointmentId('');
      setDiagnosis('');
      setAdvice('');
      setMedicines([{ ...EMPTY_MEDICINE }]);
      showToast('Prescription created.', 'success');
    },
    onError: (err) => showToast(extractErrorMessage(err), 'error'),
  });

  const updateMedicine = (index: number, field: keyof MedicineRow, value: string) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-slate-500 font-body max-w-lg">
          Write a prescription for any completed appointment that doesn't have one yet.
        </p>
        <Button
          size="sm"
          className="w-auto"
          onClick={() => setFormOpen((v) => !v)}
          disabled={eligibleAppointments.length === 0}
        >
          {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {formOpen ? 'Cancel' : 'New prescription'}
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!appointmentId) {
              showToast('Select an appointment.', 'error');
              return;
            }
            if (!diagnosis.trim()) {
              showToast('Enter a diagnosis.', 'error');
              return;
            }
            if (!medicines.some((m) => m.name.trim())) {
              showToast('Add at least one medicine.', 'error');
              return;
            }
            createMutation.mutate();
          }}
          className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm flex flex-col gap-4"
        >
          <Select
            label="Appointment"
            placeholder="Select a completed appointment"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            options={eligibleAppointments.map((a) => ({
              value: a.id,
              label: `${a.patient.firstName} ${a.patient.lastName} — ${formatDate(a.date)}`,
            }))}
          />

          <Input
            label="Diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Mild seasonal allergic rhinitis"
          />

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Medicines</p>
            <div className="flex flex-col gap-3">
              {medicines.map((med, i) => (
                <div key={i} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                  <Input
                    label={i === 0 ? 'Name' : undefined}
                    placeholder="Medicine name"
                    value={med.name}
                    onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                  />
                  <Input
                    label={i === 0 ? 'Dosage' : undefined}
                    placeholder="e.g. 1 tablet"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                  />
                  <Input
                    label={i === 0 ? 'Frequency' : undefined}
                    placeholder="e.g. Twice daily"
                    value={med.frequency}
                    onChange={(e) => updateMedicine(i, 'frequency', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setMedicines((prev) => prev.filter((_, idx) => idx !== i))}
                    className="h-12 w-12 flex items-center justify-center text-slate-400 hover:text-danger-600 transition-colors duration-fast shrink-0"
                    aria-label="Remove medicine"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }])}
              className="mt-2 text-sm text-teal-700 font-semibold hover:underline"
            >
              + Add another medicine
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 font-body">
              Advice (optional)
            </label>
            <textarea
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-300 bg-paper-0 px-3.5 py-2.5 text-base text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <Button type="submit" isLoading={createMutation.isPending} className="w-auto self-start">
            Create prescription
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)
        ) : prescriptions && prescriptions.length > 0 ? (
          prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <p className="font-display text-base text-slate-900">{rx.diagnosis}</p>
                <span className="text-xs text-slate-400">{formatDate(rx.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-1">
                {rx.medicines.map((med) => (
                  <div key={med.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <Pill className="h-4 w-4 text-teal-700" />
                    {med.name} — {med.dosage}, {med.frequency}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center text-slate-500">
            No prescriptions written yet.
          </div>
        )}
      </div>
    </div>
  );
}
