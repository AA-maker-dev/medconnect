import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, HeartPulse, Stethoscope, User } from 'lucide-react';

const OPTIONS = [
  {
    to: '/register/patient',
    icon: User,
    title: 'I need care',
    description:
      'Book appointments, message your doctor, and keep your prescriptions and history in one place.',
    accent: 'from-teal-700 to-teal-500',
  },
  {
    to: '/register/doctor',
    icon: Stethoscope,
    title: "I'm a doctor",
    description:
      'Manage your schedule, consult patients, and grow your practice. Requires license verification.',
    accent: 'from-coral-600 to-coral-500',
  },
];

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 -right-32 h-96 w-96 rounded-full bg-coral-500/10 blur-3xl" />
      </div>

      <Link to="/" className="flex items-center gap-2 mb-10">
        <HeartPulse className="h-7 w-7 text-coral-600" />
        <span className="font-display text-2xl text-teal-900">MedConnect</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-3xl sm:text-4xl text-slate-900 mb-2">
          Create your account
        </h1>
        <p className="text-slate-500 font-body max-w-md mx-auto">
          Tell us which side of the appointment you're on.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {OPTIONS.map((option, i) => (
          <motion.div
            key={option.to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
            whileHover={{ y: -4 }}
          >
            <Link
              to={option.to}
              className="group relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-paper-0 p-7 shadow-md hover:shadow-xl transition-shadow duration-base h-full overflow-hidden"
            >
              <div
                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${option.accent} opacity-10 group-hover:opacity-20 transition-opacity duration-base`}
              />
              <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${option.accent} flex items-center justify-center text-white shadow-sm relative`}
              >
                <option.icon className="h-6 w-6" />
              </div>
              <div className="relative">
                <h2 className="font-display text-xl text-slate-900 mb-1.5">
                  {option.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {option.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:gap-2 transition-all duration-fast">
                  Get started <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-700 font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
