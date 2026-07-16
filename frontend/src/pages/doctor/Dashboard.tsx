import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  Users,
  ClipboardList,
  CheckCircle2,
  Wallet as WalletIcon,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/Button';
import * as doctorDashboardService from '@/services/doctorDashboard.service';
import { useAuth } from '@/hooks/useAuth';

function formatTime(startTime: string, endTime: string) {
  return `${startTime} – ${endTime}`;
}

export default function DoctorDashboardPage() {
  useSetPageTitle('Dashboard');
  const { user } = useAuth();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['doctor', 'dashboard-summary'],
    queryFn: doctorDashboardService.fetchDashboardSummary,
  });

  const { data: today, isLoading: todayLoading } = useQuery({
    queryKey: ['doctor', 'appointments', 'today-preview'],
    queryFn: () => doctorDashboardService.fetchAppointments('today', 1, 5),
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl text-slate-900 mb-1">
          Welcome back{user ? `, Dr. ${user.email.split('@')[0]}` : ''}
        </h2>
        <p className="text-slate-500 font-body">Here's your practice at a glance today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Appointments"
          value={summary?.todayAppointments ?? 0}
          icon={CalendarClock}
          to="/doctor/appointments"
          accent="teal"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Upcoming Patients"
          value={summary?.upcomingAppointments ?? 0}
          icon={Users}
          to="/doctor/appointments"
          accent="teal"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Appointment Requests"
          value={summary?.appointmentRequests ?? 0}
          icon={ClipboardList}
          to="/doctor/appointments"
          accent="coral"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Completed"
          value={summary?.completedAppointments ?? 0}
          icon={CheckCircle2}
          to="/doctor/appointments"
          accent="success"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Total Patients"
          value={summary?.totalPatients ?? 0}
          icon={Users}
          to="/doctor/patients"
          accent="teal"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Wallet Balance"
          value={summary ? `NPR ${Number(summary.walletBalance).toLocaleString()}` : 0}
          icon={WalletIcon}
          to="/doctor/wallet"
          accent="success"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Rating"
          value={summary ? `${Number(summary.ratingAvg).toFixed(1)} (${summary.ratingCount})` : 0}
          icon={Star}
          accent="amber"
          isLoading={summaryLoading}
        />
        <StatCard
          label="Notifications"
          value={summary?.unreadNotifications ?? 0}
          icon={ClipboardList}
          to="/doctor/notifications"
          accent="coral"
          isLoading={summaryLoading}
        />
      </div>

      <div className="rounded-lg border border-slate-100 bg-paper-0 shadow-sm">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-display text-lg text-slate-900">Today's schedule</h3>
          <Link
            to="/doctor/appointments"
            className="flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {todayLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 sm:px-6 py-4 flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : today && today.items.length > 0 ? (
            today.items.map((appt) => (
              <div key={appt.id} className="px-5 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
                <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-700 font-display flex items-center justify-center shrink-0">
                  {appt.patient.firstName[0]}
                  {appt.patient.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">
                    {appt.patient.firstName} {appt.patient.lastName}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {formatTime(appt.startTime, appt.endTime)}
                    {appt.reasonForVisit ? ` · ${appt.reasonForVisit}` : ''}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700 bg-teal-100 px-2.5 py-1 rounded-full shrink-0">
                  {appt.status}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 sm:px-6 py-10 text-center text-slate-500">
              No appointments scheduled for today.
            </div>
          )}
        </div>
      </div>

      {summary && summary.appointmentRequests > 0 && (
        <div className="rounded-lg border border-coral-600/20 bg-coral-100/40 p-6 flex items-center gap-4 flex-wrap">
          <ClipboardList className="h-8 w-8 text-coral-600 shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <p className="font-display text-base text-slate-900 mb-1">
              {summary.appointmentRequests} appointment{summary.appointmentRequests > 1 ? 's' : ''} waiting on you
            </p>
            <p className="text-sm text-slate-500">
              Patients are waiting for you to approve or decline their requests.
            </p>
          </div>
          <Link to="/doctor/appointments">
            <Button size="sm" className="w-auto">
              Review requests
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
