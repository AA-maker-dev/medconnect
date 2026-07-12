import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  Sparkles,
  Smile,
  Brain,
  Bone,
  Baby,
  User,
  BrainCircuit,
  Stethoscope,
  Ear,
  type LucideIcon,
} from 'lucide-react';
import { fetchSpecializations, type Specialization } from '@/services/public.service';
import { Skeleton } from '@/components/shared/Skeleton';

const ICON_MAP: Record<string, LucideIcon> = {
  Cardiologist: HeartPulse,
  Dermatologist: Sparkles,
  Dentist: Smile,
  Neurologist: Brain,
  'Orthopedic Surgeon': Bone,
  Pediatrician: Baby,
  Gynecologist: User,
  Psychiatrist: BrainCircuit,
  'General Physician': Stethoscope,
  'ENT Specialist': Ear,
};

export function PopularDepartments() {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpecializations()
      .then(setSpecializations)
      .catch(() => setSpecializations([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-20 px-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
            Popular departments
          </h2>
          <p className="text-slate-500 font-body max-w-xl mx-auto">
            Find the right specialist for what you're dealing with.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))
            : specializations.map((spec, i) => {
                const Icon = ICON_MAP[spec.name] ?? Stethoscope;
                return (
                  <motion.button
                    key={spec.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.3, delay: (i % 5) * 0.05 }}
                    onClick={() => navigate(`/doctors?specializationId=${spec.id}`)}
                    className="group flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-teal-500/40 transition-all duration-base"
                  >
                    <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors duration-base">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 text-center leading-tight">
                      {spec.name}
                    </span>
                  </motion.button>
                );
              })}
        </div>
      </div>
    </section>
  );
}
