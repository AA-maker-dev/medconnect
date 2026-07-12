import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      {/* Bottom padding so content isn't hidden behind the fixed mobile nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
