import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { Skeleton } from '@/components/shared/Skeleton';
import * as doctorDashboardService from '@/services/doctorDashboard.service';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function calculateAge(dob: string | null) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function DoctorPatientsPage() {
  useSetPageTitle('Patients');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', 'patients'],
    queryFn: () => doctorDashboardService.fetchPatients(1, 30),
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-100 bg-paper-0 p-10 text-center text-slate-500">
        You haven't seen any patients yet — they'll appear here after their first
        appointment with you.
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.items.map((patient) => {
        const age = calculateAge(patient.dateOfBirth);
        const lastVisit = patient.appointments[0];
        return (
          <Link
            key={patient.id}
            to={`/doctor/patients/${patient.id}`}
            className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm hover:shadow-md transition-shadow duration-base flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-700 font-display flex items-center justify-center shrink-0">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base text-slate-900 truncate">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm text-slate-500">
                  {age !== null ? `${age} yrs` : 'Age unknown'}
                  {patient.bloodGroup ? ` · ${patient.bloodGroup}` : ''}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </div>

            <div className="mt-auto flex items-center justify-between text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-4 w-4" />
                {lastVisit ? formatDate(lastVisit.date) : 'No visits yet'}
              </span>
              <span>{patient._count.appointments} visit{patient._count.appointments !== 1 ? 's' : ''}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
