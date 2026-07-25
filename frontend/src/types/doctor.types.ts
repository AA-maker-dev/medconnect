export interface DoctorSpecialization {
  id: string;
  name: string;
}

export interface DoctorHospital {
  id: string;
  name: string;
  city: string;
}

export interface DoctorCard {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  qualification: string;
  experienceYears: number;
  consultationFee: string; // Decimal serializes as string over JSON
  ratingAvg: string;
  ratingCount: number;
  totalPatients: number;
  languages: string[];
  createdAt: string;
  specialization: DoctorSpecialization;
  hospital: DoctorHospital | null;
}

export interface DoctorAward {
  id: string;
  title: string;
  year: number | null;
  issuer: string | null;
}

export interface DoctorCertificate {
  id: string;
  title: string;
  fileUrl: string;
  issuedBy: string | null;
}

export interface DoctorAvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface DoctorDetail extends DoctorCard {
  bio: string | null;
  certificates: DoctorCertificate[];
  awards: DoctorAward[];
  availability: DoctorAvailabilitySlot[];
}

export interface FeaturedReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  patientName: string;
  patientAvatarUrl: string | null;
  doctorName: string;
  doctorSpecialization: string;
}

export interface PlatformStats {
  verifiedDoctors: number;
  patients: number;
  completedAppointments: number;
  specializations: number;
}
