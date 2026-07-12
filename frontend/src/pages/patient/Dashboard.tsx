import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  History,
  HeartHandshake,
  FileText,
  Receipt,
  Wallet as WalletIcon,
  Bell,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import * as patientService from '@/services/patient.service';
import { useAuth } from '@/hooks/useAuth';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function PatientDashboardPage() {
  useSetPageTitle('Dashboard');
  const { user } = useAuth();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['patient', 'dashboard-summary'],
    queryFn: patientService.fetchDashboardSummary,
  });

  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ['patient', 'appointments', 'upcoming-preview'],
    queryFn: () => patientService.fetchAppointments('upcoming', 1, 3),
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl text-slate-900 mb-1">
          Welcome back{user ? `, ${user.email.split('@')[0]}` : ''}
        </h2>
        <p className="text-slate-500 font-body">Here's what's happening with your care.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Upcoming Appointments"
          value={summary?.upcomingAppointments ?? 0}
          icon={CalendarClock}
          to="/patient/appointments"
          accent="teal"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Past Appointments"
          value={summary?.pastAppointments ?? 0}
          icon={History}
          to="/patient/appointments"
          accent="teal"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Medical History"
          value={summary?.medicalHistoryEntries ?? 0}
          icon={FileText}
          to="/patient/medical-history"
          accent="amber"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Favorite Doctors"
          value={summary?.favoriteDoctors ?? 0}
          icon={HeartHandshake}
          to="/patient/favorite-doctors"
          accent="coral"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Prescriptions"
          value={summary?.prescriptions ?? 0}
          icon={FileText}
          to="/patient/prescriptions"
          accent="teal"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Invoices"
          value={summary?.invoices ?? 0}
          icon={Receipt}
          to="/patient/invoices"
          accent="amber"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Wallet Balance"
          value={summary ? `NPR ${Number(summary.walletBalance).toLocaleString()}` : 0}
          icon={WalletIcon}
          to="/patient/wallet"
          accent="success"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Notifications"
          value={summary?.unreadNotifications ?? 0}
          icon={Bell}
          to="/patient/notifications"
          accent="coral"
          isLoading={summaryLoading}
        />
      </div>

      <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-display text-lg text-slate-900">Upcoming appointments</h3>
          <Link
            to="/patient/appointments"
            className="flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {upcomingLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="px-5 sm:px-6 py-4 flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : upcoming && upcoming.items.length > 0 ? (
            upcoming.items.map((appt) => (
              <div
                key={appt.id}
                className="px-5 sm:px-6 py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap"
              >
                <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-700 font-display flex items-center justify-center shrink-0">
                  {appt.doctor.firstName[0]}
                  {appt.doctor.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">
                    Dr. {appt.doctor.firstName} {appt.doctor.lastName}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {appt.doctor.specialization.name} · {formatDate(appt.date)} at{' '}
                    {appt.startTime}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full shrink-0">
                  {appt.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 sm:px-6 py-10 text-center">
              <p className="text-slate-500 mb-4">No upcoming appointments yet.</p>
              <Link to="/doctors">
                <Button size="sm" className="w-auto">
                  Find a doctor
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm flex items-center gap-4 flex-wrap">
        <Star className="h-8 w-8 text-amber-600 shrink-0" />
        <div className="flex-1 min-w-[200px]">
          <p className="font-display text-base text-slate-900 mb-1">
            Had a recent appointment?
          </p>
          <p className="text-sm text-slate-500">
            Leaving a review helps other patients find the right doctor.
          </p>
        </div>
        <Link to="/patient/appointments">
          <Button variant="outline" size="sm" className="w-auto">
            Review a doctor
          </Button>
        </Link>
      </div>
    </div>
  );
}
