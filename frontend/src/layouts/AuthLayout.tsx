import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Signature element lives here: the "vitals trace" — an animated ECG-style
 * line — traveling across the brand panel. It's the one recurring visual
 * motif tying every screen back to "this is a health product," used once,
 * deliberately, rather than scattered as decoration everywhere.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-ivory-50">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-teal-900 text-ivory-50 p-12 relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2 z-10">
          <HeartPulse className="h-7 w-7 text-coral-500" />
          <span className="font-display text-2xl">MedConnect</span>
        </Link>

        <div className="z-10 max-w-md">
          <h2 className="font-display text-4xl leading-tight mb-4">
            Care that fits your schedule, not the other way around.
          </h2>
          <p className="text-ivory-100/80 font-body text-lg leading-relaxed">
            Book verified doctors, message them directly about your care, and
            keep every prescription and record in one place.
          </p>
        </div>

        <svg
          viewBox="0 0 500 100"
          className="absolute bottom-16 left-0 w-full opacity-30"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,50 L100,50 L120,20 L140,80 L160,50 L500,50"
            fill="none"
            stroke="#E67F63"
            strokeWidth="2"
            strokeDasharray="1000"
            initial={{ strokeDashoffset: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
          />
        </svg>

        <p className="z-10 text-sm text-ivory-100/60">
          © {new Date().getFullYear()} MedConnect. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
              <HeartPulse className="h-6 w-6 text-coral-600" />
              <span className="font-display text-xl text-teal-900">MedConnect</span>
            </Link>
            <h1 className="font-display text-3xl text-slate-900 mb-2">{title}</h1>
            <p className="text-slate-500 font-body">{subtitle}</p>
          </div>

          {children}

          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
