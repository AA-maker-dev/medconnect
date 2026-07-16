import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  CalendarClock,
  ClipboardList,
  Users,
  MessageSquare,
  Wallet as WalletIcon,
  LineChart,
  UserCircle,
  CalendarRange,
  FileText,
  Settings,
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import * as doctorDashboardService from '@/services/doctorDashboard.service';
import type { SidebarNavItem } from '@/components/layout/DashboardSidebar';

const NAV_ITEMS: SidebarNavItem[] = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/doctor/appointments', label: 'Appointments', icon: CalendarClock },
  { to: '/doctor/patients', label: 'Patients', icon: Users },
  { to: '/doctor/messages', label: 'Messages', icon: MessageSquare },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
  { to: '/doctor/availability', label: 'Availability', icon: CalendarRange },
  { to: '/doctor/revenue', label: 'Revenue Analytics', icon: LineChart },
  { to: '/doctor/wallet', label: 'Wallet', icon: WalletIcon },
  { to: '/doctor/notifications', label: 'Notifications', icon: ClipboardList },
  { to: '/doctor/profile', label: 'Profile', icon: UserCircle },
  { to: '/doctor/settings', label: 'Settings', icon: Settings },
];

export function DoctorDashboardLayout() {
  const { data: summary } = useQuery({
    queryKey: ['doctor', 'dashboard-summary'],
    queryFn: doctorDashboardService.fetchDashboardSummary,
    refetchInterval: 60_000,
  });

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      notificationsPath="/doctor/notifications"
      profilePath="/doctor/profile"
      settingsPath="/doctor/settings"
      unreadNotifications={summary?.unreadNotifications ?? 0}
    />
  );
}
