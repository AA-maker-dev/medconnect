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

const DESCRIPTION_MAP: Record<string, string> = {
  Cardiologist: 'Heart health, blood pressure, cholesterol, and cardiovascular care.',
  Dermatologist: 'Skin conditions, acne, rashes, eczema, and cosmetic dermatology.',
  Dentist: 'Cleanings, fillings, root canals, braces, and cosmetic dentistry.',
  Neurologist: 'Brain and nervous system disorders including migraines and seizures.',
  'Orthopedic Surgeon': 'Bones, joints, ligaments, tendons, and musculoskeletal surgery.',
  Pediatrician: 'Newborn to adolescent care, vaccinations, and growth monitoring.',
  Gynecologist: "Women's health, pregnancy, reproductive care, and screenings.",
  Psychiatrist: 'Mental health, anxiety, depression, and behavioral therapy.',
  'General Physician': 'Primary care, checkups, chronic disease management, and referrals.',
  'ENT Specialist': 'Ear, nose, throat infections, hearing loss, and sinus care.',
};

export function SpecialtiesSection() {
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
    <section className="py-20 px-5 sm:px-8 bg-ivory-100">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
            Browse by specialty
          </h2>
          <p className="text-slate-500 font-body max-w-xl mx-auto">
            Choose a department to see verified doctors, their experience, and
            available appointment slots.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))
            : specializations.map((spec, i) => {
                const Icon = ICON_MAP[spec.name] ?? Stethoscope;
                const description =
                  spec.description ?? DESCRIPTION_MAP[spec.name] ?? 'Expert care and consultation in this specialty.';
                return (
                  <motion.button
                    key={spec.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.3, delay: (i % 3) * 0.05 }}
                    onClick={() => navigate(`/doctors?specializationId=${spec.id}`)}
                    className="group flex flex-col items-start gap-3 rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-teal-500/40 transition-all duration-base text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors duration-base">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900 block">
                        {spec.name}
                      </span>
                      <span className="text-xs text-slate-500 leading-relaxed mt-1 block">
                        {description}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/specialties')}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-paper-0 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors duration-fast"
          >
            View all specialties
          </button>
        </div>
      </div>
    </section>
  );
}
