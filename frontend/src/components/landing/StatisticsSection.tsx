import { useEffect, useState } from 'react';
import { Users, Stethoscope, CalendarCheck, Layers } from 'lucide-react';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { fetchPlatformStats, type PlatformStatsResponse } from '@/services/public.service';

const CARDS = [
  { key: 'verifiedDoctors' as const, label: 'Verified Doctors', icon: Stethoscope },
  { key: 'patients' as const, label: 'Registered Patients', icon: Users },
  { key: 'completedAppointments' as const, label: 'Appointments Completed', icon: CalendarCheck },
  { key: 'specializations' as const, label: 'Specializations', icon: Layers },
];

export function StatisticsSection() {
  const [stats, setStats] = useState<PlatformStatsResponse | null>(null);

  useEffect(() => {
    fetchPlatformStats()
      .then(setStats)
      .catch(() =>
        setStats({ verifiedDoctors: 0, patients: 0, completedAppointments: 0, specializations: 0 })
      );
  }, []);

  return (
    <section className="bg-teal-900 py-16 px-5 sm:px-8">
      <div className="mx-auto max-w-7xl grid grid-cols-2 lg:grid-cols-4 gap-8">
        {CARDS.map((card) => (
          <div key={card.key} className="text-center">
            <card.icon className="h-7 w-7 text-coral-500 mx-auto mb-3" />
            <div className="font-display text-3xl sm:text-4xl text-ivory-50 mb-1">
              <AnimatedCounter value={stats?.[card.key] ?? 0} suffix="+" />
            </div>
            <p className="text-sm text-ivory-100/70 font-body">{card.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
