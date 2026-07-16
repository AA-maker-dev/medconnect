import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, Star, Video, MapPin } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import { cn } from '@/utils/cn';
import * as doctorDashboardService from '@/services/doctorDashboard.service';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function DoctorPatientHistoryPage() {
  useSetPageTitle('Patient History');
  const { patientId } = useParams<{ patientId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', 'patient-history', patientId],
    queryFn: () => doctorDashboardService.fetchPatientHistory(patientId!),
    enabled: Boolean(patientId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 w-full rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center text-slate-500">
        No history found for this patient.
      </div>
    );
  }

  const { patient, appointments } = data;

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/doctor/patients"
        className="flex items-center gap-1 text-sm text-teal-700 font-semibold hover:underline w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to patients
      </Link>

      <div className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-teal-100 text-teal-700 font-display text-lg flex items-center justify-center shrink-0">
          {patient.firstName[0]}
          {patient.lastName[0]}
        </div>
        <div>
          <h2 className="font-display text-xl text-slate-900">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-sm text-slate-500">{appointments.length} appointment(s) on record</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {appointments.map((appt) => (
          <div key={appt.id} className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <span className="flex items-center gap-2 text-sm text-slate-500">
                {appt.consultationType === 'VIDEO' ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                {formatDate(appt.date)}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                  appt.status === 'COMPLETED'
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                {appt.status}
              </span>
            </div>

            {appt.reasonForVisit && (
              <p className="text-sm text-slate-700 mb-3">
                <span className="font-medium">Reason:</span> {appt.reasonForVisit}
              </p>
            )}

            {appt.prescription && (
              <div className="rounded-md bg-ivory-100 p-4 mb-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
                  <FileText className="h-4 w-4" /> {appt.prescription.diagnosis}
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {appt.prescription.medicines.map((med, i) => (
                    <li key={i}>
                      {med.name} — {med.dosage}, {med.frequency}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {appt.review && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                {appt.review.rating}/5
                {appt.review.comment && <span>— "{appt.review.comment}"</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
