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
