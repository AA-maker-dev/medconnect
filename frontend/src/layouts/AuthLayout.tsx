import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, type MotionProps } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-ivory-50">
      {/* Subtle background pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23146B63' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Soft gradient orbs */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-500/12 to-transparent blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-coral-500/10 to-transparent blur-3xl"
          animate={{
            x: [0, -25, 0],
            y: [0, -35, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[420px] mx-auto px-6 relative"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 justify-center lg:justify-start">
          <div className="relative">
            <HeartPulse className="h-7 w-7 text-coral-600" />
            <div className="absolute -inset-1 bg-coral-600/10 rounded-full blur-md" />
          </div>
          <span className="font-display text-2xl text-teal-900 tracking-tight">MedConnect</span>
        </Link>

        {/* Header */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <h1 className="font-display text-3xl text-slate-900 mb-2 tracking-tight">{title}</h1>
          <p className="text-slate-500 font-body text-[15px] leading-relaxed">{subtitle}</p>
        </motion.div>

        {/* Form card */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-paper-0 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] p-7 sm:p-8"
        >
          {children}
        </motion.div>

        {footer && (
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 text-center text-sm text-slate-500"
          >
            {footer}
          </motion.div>
        )}
      </motion.div>

      {/* Bottom brand mark */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-6 text-xs text-slate-400"
      >
        © {new Date().getFullYear()} MedConnect. All rights reserved.
      </motion.p>
    </div>
  );
}
