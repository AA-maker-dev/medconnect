import { motion } from 'framer-motion';
import { Droplets, Moon, Salad, Footprints } from 'lucide-react';

const TIPS = [
  {
    icon: Droplets,
    title: 'Stay hydrated',
    description:
      'Aim for 8 glasses of water a day — dehydration is one of the most common, most overlooked causes of fatigue and headaches.',
  },
  {
    icon: Moon,
    title: 'Protect your sleep',
    description:
      '7–9 hours a night isn\'t a luxury. Poor sleep is linked to higher risk of heart disease, weight gain, and weakened immunity.',
  },
  {
    icon: Salad,
    title: 'Eat the rainbow',
    description:
      'Different colored fruits and vegetables carry different micronutrients — variety matters as much as quantity.',
  },
  {
    icon: Footprints,
    title: 'Move daily',
    description:
      'Just 30 minutes of walking a day measurably lowers blood pressure and improves mood — no gym required.',
  },
];

export function HealthTipsSection() {
  return (
    <section className="py-20 px-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
            Health tips worth keeping
          </h2>
          <p className="text-slate-500 font-body max-w-xl mx-auto">
            Small, evidence-backed habits from our medical team.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIPS.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="rounded-lg border border-slate-100 bg-paper-0 p-6 shadow-sm hover:shadow-md transition-shadow duration-base"
            >
              <div className="h-11 w-11 rounded-md bg-coral-100 text-coral-600 flex items-center justify-center mb-4">
                <tip.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg text-slate-900 mb-2">{tip.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{tip.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
