import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, Stethoscope, User } from 'lucide-react';

const OPTIONS = [
  {
    to: '/register/patient',
    icon: User,
    title: 'I need care',
    description:
      'Book appointments, message your doctor, and keep your prescriptions and history in one place.',
  },
  {
    to: '/register/doctor',
    icon: Stethoscope,
    title: "I'm a doctor",
    description:
      'Manage your schedule, consult patients, and grow your practice. Requires license verification.',
  },
];

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col items-center justify-center p-6">
      <Link to="/" className="flex items-center gap-2 mb-10">
        <HeartPulse className="h-7 w-7 text-coral-600" />
        <span className="font-display text-2xl text-teal-900">MedConnect</span>
      </Link>

      <h1 className="font-display text-3xl text-slate-900 mb-2 text-center">
        Create your account
      </h1>
      <p className="text-slate-500 font-body mb-10 text-center max-w-md">
        Tell us which side of the appointment you're on.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {OPTIONS.map((option, i) => (
          <motion.div
            key={option.to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: [0.2, 0, 0, 1] }}
          >
            <Link
              to={option.to}
              className="group flex flex-col gap-4 rounded-lg border border-slate-100 bg-paper-0 p-7 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-base h-full"
            >
              <div className="h-12 w-12 rounded-md bg-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors duration-base">
                <option.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-xl text-slate-900 mb-1.5">
                  {option.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {option.description}
                </p>
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
