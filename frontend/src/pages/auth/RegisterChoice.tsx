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
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23146B63' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        <Link to="/" className="flex items-center gap-2 mb-10">
          <HeartPulse className="h-7 w-7 text-coral-600" />
          <span className="font-display text-2xl text-teal-900">MedConnect</span>
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl text-slate-900 mb-2">
          Create your account
        </h1>
        <p className="text-slate-500 font-body max-w-md mb-10">
          Tell us which side of the appointment you're on.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          {OPTIONS.map((option, i) => (
            <motion.div
              key={option.to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={option.to}
                className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-paper-0 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.1)] transition-shadow duration-300 h-full overflow-hidden"
              >
                <div
                  className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${option.accent} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300`}
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
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
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
      </motion.div>
    </div>
  );
}
