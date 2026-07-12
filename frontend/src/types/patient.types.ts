export interface DashboardSummary {
  upcomingAppointments: number;
  pastAppointments: number;
  medicalHistoryEntries: number;
  favoriteDoctors: number;
  prescriptions: number;
  invoices: number;
  walletBalance: string;
  unreadNotifications: number;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface AppointmentDoctorSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  qualification: string;
  consultationFee: string;
  ratingAvg: string;
  ratingCount: number;
  specialization: { id: string; name: string };
  hospital: { id: string; name: string; city: string } | null;
}

export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: 'IN_PERSON' | 'VIDEO';
  reasonForVisit: string | null;
  meetingRoomId: string | null;
  doctor: AppointmentDoctorSummary;
  review: { id: string } | null;
  prescription: { id: string } | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MedicalHistoryEntry {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  recordedAt: string;
}

export interface FavoriteDoctorEntry {
  id: string;
  createdAt: string;
  doctor: AppointmentDoctorSummary;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number | null;
}

export interface LabReport {
  id: string;
  title: string;
  fileUrl: string;
}

export interface Prescription {
  id: string;
  diagnosis: string;
  advice: string | null;
  pdfUrl: string | null;
  createdAt: string;
  doctor: { firstName: string; lastName: string; specialization: { name: string } };
  appointment: { id: string; date: string };
  medicines: PrescriptionMedicine[];
  labReports: LabReport[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: string;
  tax: string;
  total: string;
  pdfUrl: string | null;
  createdAt: string;
  appointment: { date: string; doctor: { firstName: string; lastName: string } };
  payment: { status: string; gateway: string } | null;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  reason: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  balance: string;
  transactions: WalletTransaction[];
}

export type NotificationType =
  | 'APPOINTMENT_APPROVED'
  | 'APPOINTMENT_REJECTED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_REMINDER'
  | 'NEW_MESSAGE'
  | 'PRESCRIPTION_UPLOADED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REVIEW_RECEIVED'
  | 'DOCTOR_VERIFIED'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  address: string | null;
  city: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  user: { email: string; phone: string | null; isEmailVerified: boolean };
}
