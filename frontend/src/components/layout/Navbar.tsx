import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartPulse, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/specialties', label: 'Specialties' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-[100] w-full transition-all duration-base',
        scrolled
          ? 'bg-paper-0/80 backdrop-blur-glass shadow-sm border-b border-slate-100'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-8 h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <HeartPulse className="h-6 w-6 text-coral-600" />
          <span className="font-display text-xl text-teal-900">MedConnect</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium font-body transition-colors duration-fast',
                  isActive ? 'text-teal-700' : 'text-slate-700 hover:text-teal-700'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm" className="w-auto">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="w-auto">
              Register
            </Button>
          </Link>
        </div>

        {/* Mobile trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="h-10 w-10 flex items-center justify-center text-slate-700"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[150] bg-slate-900/40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="fixed right-0 top-0 z-[200] h-full w-[80%] max-w-sm bg-paper-0 shadow-lg p-6 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-lg text-teal-900">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="h-10 w-10 flex items-center justify-center text-slate-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-3 text-base font-medium font-body transition-colors duration-fast',
                        isActive
                          ? 'bg-teal-100 text-teal-700'
                          : 'text-slate-700 hover:bg-ivory-100'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button>Register</Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
