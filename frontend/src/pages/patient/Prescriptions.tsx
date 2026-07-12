import { useQuery } from '@tanstack/react-query';
import { Download, Pill, FlaskConical } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import * as patientService from '@/services/patient.service';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PrescriptionsPage() {
  useSetPageTitle('Prescriptions');

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['patient', 'prescriptions'],
    queryFn: patientService.fetchPrescriptions,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center text-slate-500">
        No prescriptions yet. They'll appear here after a completed appointment.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {prescriptions.map((rx) => (
        <div key={rx.id} className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <p className="font-display text-base text-slate-900">
                Dr. {rx.doctor.firstName} {rx.doctor.lastName}
              </p>
              <p className="text-sm text-slate-500">
                {rx.doctor.specialization.name} · {formatDate(rx.createdAt)}
              </p>
            </div>
            {rx.pdfUrl ? (
              <a href={rx.pdfUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" className="w-auto">
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
              </a>
            ) : (
              <span className="text-xs text-slate-400">PDF not yet generated</span>
            )}
          </div>

          <div className="px-5 sm:px-6 py-4 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                Diagnosis
              </p>
              <p className="text-slate-900">{rx.diagnosis}</p>
            </div>

            {rx.medicines.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Medicines
                </p>
                <div className="flex flex-col gap-2">
                  {rx.medicines.map((med) => (
                    <div key={med.id} className="flex items-start gap-2 text-sm">
                      <Pill className="h-4 w-4 text-teal-700 mt-0.5 shrink-0" />
                      <span>
                        <span className="font-medium text-slate-900">{med.name}</span>{' '}
                        <span className="text-slate-500">
                          — {med.dosage}, {med.frequency}
                          {med.durationDays ? ` for ${med.durationDays} days` : ''}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rx.labReports.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Lab Reports
                </p>
                <div className="flex flex-col gap-2">
                  {rx.labReports.map((report) => (
                    <a
                      key={report.id}
                      href={report.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-teal-700 hover:underline"
                    >
                      <FlaskConical className="h-4 w-4" /> {report.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {rx.advice && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Doctor's advice
                </p>
                <p className="text-sm text-slate-500">{rx.advice}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
