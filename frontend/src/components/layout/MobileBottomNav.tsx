import { NavLink } from 'react-router-dom';
import { Home, Search, Stethoscope, Phone, UserCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/contact', label: 'Emergency', icon: Phone },
  { to: '/login', label: 'Account', icon: UserCircle },
];

/** Visible only below the lg breakpoint — the desktop navbar covers wider screens. */
export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex lg:hidden bg-paper-0 border-t border-slate-100 shadow-lg">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-body transition-colors duration-fast',
              isActive ? 'text-teal-700' : 'text-slate-500'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
