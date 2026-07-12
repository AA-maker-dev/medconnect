import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/utils/cn';

interface DashboardTopbarProps {
  title: string;
  onOpenMobileMenu: () => void;
  unreadNotifications?: number;
  notificationsPath: string;
  profilePath: string;
  settingsPath: string;
}

export function DashboardTopbar({
  title,
  onOpenMobileMenu,
  unreadNotifications = 0,
  notificationsPath,
  profilePath,
  settingsPath,
}: DashboardTopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-[90] flex items-center justify-between h-16 px-5 sm:px-8 bg-paper-0/80 backdrop-blur-glass border-b border-slate-100">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="lg:hidden h-9 w-9 flex items-center justify-center text-slate-700"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <ThemeToggle />

        <Link
          to={notificationsPath}
          aria-label="Notifications"
          className="relative h-10 w-10 flex items-center justify-center text-slate-700 hover:bg-ivory-100 rounded-full transition-colors duration-fast"
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-coral-600" />
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-ivory-100 transition-colors duration-fast"
          >
            <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <UserCircle className="h-5 w-5" />
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-slate-500 transition-transform duration-fast hidden sm:block',
                menuOpen && 'rotate-180'
              )}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-100 bg-paper-0 shadow-lg py-1.5 z-[100]">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role.toLowerCase()} account
                </p>
              </div>
              <Link
                to={profilePath}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-ivory-100"
              >
                <UserCircle className="h-4 w-4" /> Profile
              </Link>
              <Link
                to={settingsPath}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-ivory-100"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-danger-600 hover:bg-danger-100"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
