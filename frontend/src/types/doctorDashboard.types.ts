export interface DoctorDashboardSummary {
  todayAppointments: number;
  upcomingAppointments: number;
  appointmentRequests: number;
  completedAppointments: number;
  totalPatients: number;
  walletBalance: string;
  unreadNotifications: number;
  ratingAvg: string;
  ratingCount: number;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export interface DoctorAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: 'IN_PERSON' | 'VIDEO';
  reasonForVisit: string | null;
  meetingRoomId: string | null;
  createdAt: string;
  patient: PatientSummary;
  prescription: { id: string } | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DoctorPatientListItem extends PatientSummary {
  bloodGroup: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  appointments: Array<{ date: string; status: AppointmentStatus }>;
  _count: { appointments: number };
}

export interface PatientHistoryAppointment {
  id: string;
  date: string;
  status: AppointmentStatus;
  consultationType: 'IN_PERSON' | 'VIDEO';
  reasonForVisit: string | null;
  prescription: {
    id: string;
    diagnosis: string;
    advice: string | null;
    medicines: Array<{ name: string; dosage: string; frequency: string }>;
  } | null;
  review: { rating: number; comment: string | null } | null;
}

export interface PatientHistory {
  patient: PatientSummary;
  appointments: PatientHistoryAppointment[];
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthly: Array<{ month: string; revenue: number }>;
  completedCount: number;
  cancelledCount: number;
  completionRate: number;
}

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface DoctorWalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  reason: string;
  createdAt: string;
}

export interface DoctorWallet {
  id: string;
  balance: string;
  transactions: DoctorWalletTransaction[];
}

export interface DoctorPrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number | null;
  instructions: string | null;
}

export interface DoctorPrescription {
  id: string;
  diagnosis: string;
  advice: string | null;
  pdfUrl: string | null;
  createdAt: string;
  appointment: { id: string; date: string };
  medicines: DoctorPrescriptionMedicine[];
}

export interface DoctorFullProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  gender: string | null;
  bio: string | null;
  qualification: string;
  experienceYears: number;
  consultationFee: string;
  languages: string[];
  location: string | null;
  ratingAvg: string;
  ratingCount: number;
  totalPatients: number;
  user: { email: string; phone: string | null; isEmailVerified: boolean };
  specialization: { id: string; name: string };
  hospital: { id: string; name: string; city: string } | null;
  awards: Array<{ id: string; title: string; year: number | null; issuer: string | null }>;
  certificates: Array<{ id: string; title: string; fileUrl: string; issuedBy: string | null }>;
  availability: AvailabilitySlot[];
}
