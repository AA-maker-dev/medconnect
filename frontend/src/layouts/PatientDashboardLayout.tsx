import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  CalendarClock,
  History,
  HeartHandshake,
  MessageSquare,
  FileText,
  Receipt,
  Wallet as WalletIcon,
  Bell,
  UserCircle,
  Settings,
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import * as patientService from '@/services/patient.service';
import type { SidebarNavItem } from '@/components/layout/DashboardSidebar';

const NAV_ITEMS: SidebarNavItem[] = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patient/appointments', label: 'Appointments', icon: CalendarClock },
  { to: '/patient/medical-history', label: 'Medical History', icon: History },
  { to: '/patient/favorite-doctors', label: 'Favorite Doctors', icon: HeartHandshake },
  { to: '/patient/messages', label: 'Messages', icon: MessageSquare },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
  { to: '/patient/invoices', label: 'Invoices', icon: Receipt },
  { to: '/patient/wallet', label: 'Wallet', icon: WalletIcon },
  { to: '/patient/notifications', label: 'Notifications', icon: Bell },
  { to: '/patient/profile', label: 'Profile', icon: UserCircle },
  { to: '/patient/settings', label: 'Settings', icon: Settings },
];

export function PatientDashboardLayout() {
  const { data: summary } = useQuery({
    queryKey: ['patient', 'dashboard-summary'],
    queryFn: patientService.fetchDashboardSummary,
    refetchInterval: 60_000,
  });

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      notificationsPath="/patient/notifications"
      profilePath="/patient/profile"
      settingsPath="/patient/settings"
      unreadNotifications={summary?.unreadNotifications ?? 0}
    />
  );
}
