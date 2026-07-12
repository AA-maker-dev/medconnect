import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface DashboardSidebarProps {
  items: SidebarNavItem[];
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ items, onNavigate }: { items: SidebarNavItem[]; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 px-6 h-16 shrink-0">
        <HeartPulse className="h-6 w-6 text-coral-500" />
        <span className="font-display text-lg text-ivory-50">MedConnect</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium font-body transition-colors duration-fast',
                isActive
                  ? 'bg-ivory-50/10 text-ivory-50'
                  : 'text-ivory-100/70 hover:bg-ivory-50/5 hover:text-ivory-50'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export function DashboardSidebar({ items, mobileOpen, onClose }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop — permanent sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-teal-900 h-screen sticky top-0">
        <SidebarContent items={items} />
      </aside>

      {/* Mobile — slide-over drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[150] bg-slate-900/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="fixed left-0 top-0 z-[200] h-full w-72 bg-teal-900 flex flex-col lg:hidden"
            >
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="absolute right-3 top-3 h-9 w-9 flex items-center justify-center text-ivory-100/70"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent items={items} onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
