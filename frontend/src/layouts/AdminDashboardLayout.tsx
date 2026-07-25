import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ShieldCheck,
  CalendarClock,
  CreditCard,
  LineChart,
  BarChart3,
  Star,
  Bell,
  UserCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import * as adminDashboardService from '@/services/adminDashboard.service';
import type { SidebarNavItem } from '@/components/layout/DashboardSidebar';

const NAV_ITEMS: SidebarNavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/patients', label: 'Manage Patients', icon: Users },
  { to: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
  { to: '/admin/verify-doctors', label: 'Verify Doctors', icon: ShieldCheck },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarClock },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/revenue', label: 'Revenue', icon: LineChart },
  { to: '/admin/analytics', label: 'System Analytics', icon: BarChart3 },
  { to: '/admin/reviews', label: 'Manage Reviews', icon: Star },
  { to: '/admin/notifications', label: 'Manage Notifications', icon: Bell },
  { to: '/admin/profile', label: 'Profile', icon: UserCircle },
];

export function AdminDashboardLayout() {
  const { data: summary } = useQuery({
    queryKey: ['admin', 'dashboard-summary'],
    queryFn: adminDashboardService.fetchDashboardSummary,
    refetchInterval: 60_000,
  });

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      notificationsPath="/admin/notifications"
      profilePath="/admin/profile"
      settingsPath="/admin/settings"
      unreadNotifications={summary?.unreadNotifications ?? 0}
    />
  );
}
