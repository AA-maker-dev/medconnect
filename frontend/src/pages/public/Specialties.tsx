import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

export default function SpecialtiesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    fetchSpecializations()
      .then(setSpecializations)
      .catch(() => setSpecializations([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = specializations.filter((spec) =>
    spec.name.toLowerCase().includes(search.trim().toLowerCase())
  );

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
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight text-slate-900 mb-5">
            Browse <span className="text-teal-700">specialties</span>
          </h1>
          <p className="text-lg text-slate-500 font-body max-w-2xl mx-auto mb-8">
            Explore our departments and find the right verified doctor for your
            needs.
          </p>

          <div className="max-w-xl mx-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a specialty..."
              className="w-full rounded-md border border-slate-300 bg-paper-0 px-4 py-3 text-base font-body text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-500 font-body py-10">
              No specialties found matching your search.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((spec, i) => {
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
          )}
        </div>
      </section>
    </div>
  );
}
