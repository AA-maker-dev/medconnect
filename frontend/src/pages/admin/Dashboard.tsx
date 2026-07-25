import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  ShieldAlert,
  CalendarClock,
  CheckCircle2,
  Star,
  EyeOff,
  Wallet as WalletIcon,
  ArrowRight,
} from 'lucide-react';
import { useSetPageTitle } from '@/context/PageTitleContext';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/Button';
import * as adminDashboardService from '@/services/adminDashboard.service';

export default function AdminDashboardPage() {
  useSetPageTitle('Dashboard');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard-summary'],
    queryFn: adminDashboardService.fetchDashboardSummary,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl text-slate-900 mb-1">Platform overview</h2>
        <p className="text-slate-500 font-body">
          A snapshot of everything happening on MedConnect right now.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value={summary?.totalPatients ?? 0}
          icon={Users}
          to="/admin/patients"
          accent="teal"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Doctors"
          value={summary?.totalDoctors ?? 0}
          icon={Stethoscope}
          to="/admin/doctors"
          accent="teal"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending Verifications"
          value={summary?.pendingVerifications ?? 0}
          icon={ShieldAlert}
          to="/admin/verify-doctors"
          accent="coral"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Appointments"
          value={summary?.totalAppointments ?? 0}
          icon={CalendarClock}
          to="/admin/appointments"
          accent="teal"
          isLoading={isLoading}
        />
        <StatCard
          label="Completed"
          value={summary?.completedAppointments ?? 0}
          icon={CheckCircle2}
          to="/admin/appointments"
          accent="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Platform Revenue"
          value={summary ? `NPR ${Number(summary.totalRevenue).toLocaleString()}` : 0}
          icon={WalletIcon}
          to="/admin/revenue"
          accent="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Reviews"
          value={summary?.totalReviews ?? 0}
          icon={Star}
          to="/admin/reviews"
          accent="amber"
          isLoading={isLoading}
        />
        <StatCard
          label="Hidden Reviews"
          value={summary?.hiddenReviews ?? 0}
          icon={EyeOff}
          to="/admin/reviews"
          accent="coral"
          isLoading={isLoading}
        />
      </div>

      {summary && summary.pendingVerifications > 0 && (
        <div className="rounded-lg border border-coral-600/20 bg-coral-100/40 p-6 flex items-center gap-4 flex-wrap">
          <ShieldAlert className="h-8 w-8 text-coral-600 shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <p className="font-display text-base text-slate-900 mb-1">
              {summary.pendingVerifications} doctor
              {summary.pendingVerifications > 1 ? 's' : ''} waiting on license verification
            </p>
            <p className="text-sm text-slate-500">
              Their profiles stay hidden from patients until you review them.
            </p>
          </div>
          <Link to="/admin/verify-doctors">
            <Button size="sm" className="w-auto">
              Review now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
