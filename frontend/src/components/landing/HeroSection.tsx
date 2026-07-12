import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Stethoscope, Pill, HeartPulse, Syringe, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const FLOATING_ICONS = [
  { Icon: Stethoscope, top: '12%', left: '8%', delay: 0, size: 'h-8 w-8' },
  { Icon: Pill, top: '68%', left: '5%', delay: 0.6, size: 'h-7 w-7' },
  { Icon: HeartPulse, top: '20%', left: '90%', delay: 0.3, size: 'h-9 w-9' },
  { Icon: Syringe, top: '75%', left: '88%', delay: 0.9, size: 'h-7 w-7' },
  { Icon: Activity, top: '45%', left: '95%', delay: 1.2, size: 'h-6 w-6' },
];

export function HeroSection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-100/60 via-ivory-50 to-ivory-50 pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Gradient blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute top-20 -right-24 h-80 w-80 rounded-full bg-coral-500/20 blur-3xl"
      />

      {/* Floating medical icons — decorative, hidden on small screens to avoid clutter */}
      <div className="hidden md:block" aria-hidden>
        {FLOATING_ICONS.map(({ Icon, top, left, delay, size }, i) => (
          <motion.div
            key={i}
            className="absolute text-teal-700/25"
            style={{ top, left }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon className={size} />
          </motion.div>
        ))}
      </div>

      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block rounded-full bg-teal-100 text-teal-700 text-sm font-semibold px-4 py-1.5 mb-6"
        >
          Trusted by 500+ verified doctors across Nepal
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-slate-900 mb-5"
        >
          Care that fits your schedule,{' '}
          <span className="text-teal-700">not the other way around</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-slate-500 font-body max-w-2xl mx-auto mb-10"
        >
          Search by disease, specialization, or doctor name — book an appointment,
          message your doctor directly, and keep every prescription in one place.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search disease, doctor, or specialty..."
              className="w-full rounded-md border border-slate-300 bg-paper-0 pl-12 pr-4 text-base font-body text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              style={{ height: '3.25rem' }}
            />
          </div>
          <Button type="submit" size="lg" className="w-auto sm:w-auto whitespace-nowrap">
            Find a doctor
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500"
        >
          <span>Popular:</span>
          {['Heart Disease', 'Skin Disease', 'Dental Problem', 'General Checkup'].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                className="rounded-full border border-slate-300 px-3 py-1 hover:border-teal-500 hover:text-teal-700 transition-colors duration-fast"
              >
                {tag}
              </button>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}
