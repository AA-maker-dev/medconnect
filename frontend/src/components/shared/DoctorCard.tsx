import { motion } from 'framer-motion';
import { Star, MapPin, Briefcase, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { DoctorCard as DoctorCardType } from '@/types/doctor.types';

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function DoctorCard({ doctor }: { doctor: DoctorCardType }) {
  const rating = Number(doctor.ratingAvg);
  const fee = Number(doctor.consultationFee);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      className="rounded-lg border border-slate-100 bg-paper-0 p-5 shadow-md hover:shadow-lg transition-shadow duration-base flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        {doctor.avatarUrl ? (
          <img
            src={doctor.avatarUrl}
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            className="h-14 w-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-teal-100 text-teal-700 font-display text-lg flex items-center justify-center shrink-0">
            {initials(doctor.firstName, doctor.lastName)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-display text-base text-slate-900 truncate">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <BadgeCheck className="h-4 w-4 text-teal-600 shrink-0" aria-label="Verified" />
          </div>
          <p className="text-sm text-slate-500 truncate">{doctor.specialization.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-700 mb-3">
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
          {rating.toFixed(1)}{' '}
          <span className="text-slate-500">({doctor.ratingCount})</span>
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <Briefcase className="h-4 w-4" />
          {doctor.experienceYears} yrs
        </span>
      </div>

      {doctor.hospital && (
        <p className="flex items-center gap-1 text-sm text-slate-500 mb-4 truncate">
          <MapPin className="h-4 w-4 shrink-0" />
          {doctor.hospital.name}, {doctor.hospital.city}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">Consultation</p>
          <p className="font-display text-lg text-teal-900">NPR {fee.toLocaleString()}</p>
        </div>
        <Button size="sm" className="w-auto">
          Book now
        </Button>
      </div>
    </motion.div>
  );
}
