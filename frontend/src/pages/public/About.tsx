import { ShieldCheck, Clock, Users, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Verified doctors only',
    description:
      'Every doctor on MedConnect is manually reviewed by our admin team. We check licenses, credentials, and experience before a profile goes live.',
  },
  {
    icon: Clock,
    title: 'Book in minutes',
    description:
      'Search by specialty, pick a time, and confirm — no long phone calls, no waiting on hold. Your appointment is locked in instantly.',
  },
  {
    icon: Users,
    title: 'Built for patients',
    description:
      'From prescription history to follow-up messages, everything you need lives in one dashboard designed for real patients.',
  },
  {
    icon: Stethoscope,
    title: 'Care beyond the clinic',
    description:
      'Chat with your doctor after appointments, download prescriptions, and keep your medical history organized — all in one place.',
  },
];

const STATS = [
  { label: 'Verified doctors', value: '500+' },
  { label: 'Patients served', value: '10K+' },
  { label: 'Specialties', value: '50+' },
  { label: 'Hospitals', value: '100+' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-100/60 via-ivory-50 to-ivory-50 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div
          aria-hidden
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute top-20 -right-24 h-80 w-80 rounded-full bg-coral-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block rounded-full bg-teal-100 text-teal-700 text-sm font-semibold px-4 py-1.5 mb-6"
          >
            About MedConnect
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-slate-900 mb-5"
          >
            Healthcare that meets you{' '}
            <span className="text-teal-700">where you are</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-500 font-body max-w-2xl mx-auto"
          >
            MedConnect bridges the gap between patients and verified healthcare
            professionals. We make it simple to find the right doctor, book an
            appointment, and manage your care — all from one platform.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
              What we stand for
            </h2>
            <p className="text-slate-500 font-body max-w-xl mx-auto">
              Every feature we build starts with one question: does this help
              patients get better care faster?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm hover:shadow-md transition-shadow duration-base"
              >
                <div className="h-11 w-11 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg text-slate-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 sm:px-8 bg-ivory-100">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
              Our impact in numbers
            </h2>
            <p className="text-slate-500 font-body max-w-xl mx-auto">
              A growing community of doctors and patients who trust MedConnect
              for their healthcare journey.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm text-center"
              >
                <p className="font-display text-3xl sm:text-4xl text-teal-700 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-5">
            Ready to find your doctor?
          </h2>
          <p className="text-slate-500 font-body max-w-xl mx-auto mb-8">
            Browse verified specialists across Nepal and book an appointment in
            minutes — no account required to search.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/doctors"
              className="inline-flex items-center justify-center rounded-md bg-teal-700 px-6 py-3 text-base font-semibold text-white hover:bg-teal-800 transition-colors duration-fast"
            >
              Find a doctor
            </a>
            <a
              href="/specialties"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-paper-0 px-6 py-3 text-base font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors duration-fast"
            >
              View all specialties
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
