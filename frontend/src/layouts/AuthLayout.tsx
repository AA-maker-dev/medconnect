import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, ShieldCheck, Star, Stethoscope, Users } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const FLOATING_BADGES = [
  { icon: ShieldCheck, label: 'Verified doctors', top: '14%', left: '6%', delay: 0 },
  { icon: Star, label: '4.9 average rating', top: '68%', left: '10%', delay: 0.4 },
  { icon: Users, label: '12,000+ patients', top: '30%', left: '82%', delay: 0.8 },
];

/**
 * Signature element: a soft animated gradient mesh behind a glass card,
 * plus one recurring "vitals trace" line — the same motif used on the
 * landing page hero — so auth feels like a continuation of the brand,
 * not a generic template swapped in for the login flow.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr] bg-ivory-50">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-teal-900 p-12">
        {/* Animated gradient mesh */}
        <div aria-hidden className="absolute inset-0">
          <motion.div
            className="absolute -top-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-teal-500/30 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 -right-24 h-[24rem] w-[24rem] rounded-full bg-coral-500/25 blur-3xl"
            animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:28px_28px]" />
        </div>

        <Link to="/" className="flex items-center gap-2 z-10">
          <HeartPulse className="h-7 w-7 text-coral-500" />
          <span className="font-display text-2xl text-ivory-50">MedConnect</span>
        </Link>

        {/* Floating proof badges */}
        <div className="hidden xl:block" aria-hidden>
          {FLOATING_BADGES.map(({ icon: Icon, label, top, left, delay }) => (
            <motion.div
              key={label}
              className="absolute flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-sm text-ivory-50 shadow-lg"
              style={{ top, left }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon className="h-4 w-4 text-coral-400" />
              {label}
            </motion.div>
          ))}
        </div>

        <div className="z-10 max-w-md">
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-sm text-ivory-100/70 ml-2">
              Trusted by thousands of patients
            </span>
          </div>
          <h2 className="font-display text-4xl leading-tight text-ivory-50 mb-4">
            Care that fits your schedule, not the other way around.
          </h2>
          <p className="text-ivory-100/80 font-body text-lg leading-relaxed mb-8">
            Book verified doctors, message them directly about your care, and keep every
            prescription and record in one place.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-ivory-100/80">
              <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-coral-400" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-ivory-50 leading-none">500+</p>
                <p className="text-ivory-100/60">Verified doctors</p>
              </div>
            </div>
            <div className="h-8 w-px bg-ivory-100/20" />
            <div className="flex items-center gap-2 text-ivory-100/80">
              <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-coral-400" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-ivory-50 leading-none">100%</p>
                <p className="text-ivory-100/60">License verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vitals trace divider */}
        <svg
          viewBox="0 0 500 60"
          className="w-full opacity-40 z-10"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,30 L110,30 L130,8 L150,52 L170,30 L500,30"
            fill="none"
            stroke="#E67F63"
            strokeWidth="2"
            strokeDasharray="1000"
            initial={{ strokeDashoffset: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
          />
        </svg>

        <p className="z-10 text-sm text-ivory-100/50">
          © {new Date().getFullYear()} MedConnect. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
        <div
          aria-hidden
          className="lg:hidden absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
          className="w-full max-w-md relative"
        >
          <div className="mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
              <HeartPulse className="h-6 w-6 text-coral-600" />
              <span className="font-display text-xl text-teal-900">MedConnect</span>
            </Link>
            <h1 className="font-display text-3xl text-slate-900 mb-2">{title}</h1>
            <p className="text-slate-500 font-body">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-paper-0 shadow-lg p-6 sm:p-8">
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
