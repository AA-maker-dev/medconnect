import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar, type SidebarNavItem } from '@/components/layout/DashboardSidebar';
import { DashboardTopbar } from '@/components/layout/DashboardTopbar';
import { PageTitleProvider, usePageTitleContext } from '@/context/PageTitleContext';

interface DashboardLayoutProps {
  navItems: SidebarNavItem[];
  notificationsPath: string;
  profilePath: string;
  settingsPath: string;
  unreadNotifications?: number;
}

function DashboardLayoutInner({
  navItems,
  notificationsPath,
  profilePath,
  settingsPath,
  unreadNotifications,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { title } = usePageTitleContext();

  return (
    <div className="flex min-h-screen bg-ivory-50">
      <DashboardSidebar
        items={navItems}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardTopbar
          title={title}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          unreadNotifications={unreadNotifications}
          notificationsPath={notificationsPath}
          profilePath={profilePath}
          settingsPath={settingsPath}
        />
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <PageTitleProvider>
      <DashboardLayoutInner {...props} />
    </PageTitleProvider>
  );
}
