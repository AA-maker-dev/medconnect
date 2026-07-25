import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import { InteractiveBackground } from '@/components/InteractiveBackground';

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
      <InteractiveBackground />

      {/* Soft gradient orbs */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-500/10 to-transparent blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-coral-500/8 to-transparent blur-3xl"
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
        style={{ zIndex: 1 }}
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
          className="bg-paper-0/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] p-7 sm:p-8"
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
        style={{ zIndex: 1 }}
      >
        © {new Date().getFullYear()} MedConnect. All rights reserved.
      </motion.p>
    </div>
  );
}
