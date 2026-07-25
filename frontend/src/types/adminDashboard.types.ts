export interface AdminDashboardSummary {
  totalPatients: number;
  totalDoctors: number;
  pendingVerifications: number;
  totalAppointments: number;
  completedAppointments: number;
  totalReviews: number;
  hiddenReviews: number;
  totalRevenue: string;
  unreadNotifications: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserRef {
  id: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface AdminPatientListItem {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  city: string | null;
  createdAt: string;
  user: AdminUserRef;
  _count: { appointments: number };
}

export interface AdminPatientDetail extends Omit<AdminPatientListItem, 'user'> {
  user: AdminUserRef & { createdAt: string };
  appointments: Array<{
    id: string;
    date: string;
    status: string;
    doctor: { firstName: string; lastName: string };
  }>;
  _count: { appointments: number; reviews: number };
}

export type DoctorVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AdminDoctorListItem {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  qualification: string;
  experienceYears: number;
  consultationFee: string;
  licenseNumber: string;
  verificationStatus: DoctorVerificationStatus;
  verificationDocs: string[];
  ratingAvg: string;
  ratingCount: number;
  createdAt: string;
  specialization: { id: string; name: string };
  hospital: { id: string; name: string; city: string } | null;
  user: AdminUserRef;
}

export interface AdminDoctorDetail extends AdminDoctorListItem {
  bio: string | null;
  awards: Array<{ id: string; title: string; year: number | null }>;
  certificates: Array<{ id: string; title: string; fileUrl: string }>;
  _count: { appointments: number; reviews: number };
}

export interface AdminAppointmentListItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  consultationType: 'IN_PERSON' | 'VIDEO';
  createdAt: string;
  patient: { firstName: string; lastName: string };
  doctor: { firstName: string; lastName: string; specialization: { name: string } };
  payment: { status: string; amount: string } | null;
}

export interface AdminPaymentListItem {
  id: string;
  amount: string;
  gateway: 'ESEWA' | 'FONEPAY' | 'WALLET';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  gatewayTxnId: string | null;
  refundedAmount: string | null;
  refundedAt: string | null;
  createdAt: string;
  appointment: {
    id: string;
    patient: { firstName: string; lastName: string };
    doctor: { firstName: string; lastName: string };
  };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthly: Array<{ month: string; revenue: number }>;
  byGateway: Array<{ gateway: string; revenue: number }>;
}

export interface SystemAnalytics {
  patientGrowth: Array<{ month: string; count: number }>;
  doctorGrowth: Array<{ month: string; count: number }>;
  appointmentVolume: Array<{ month: string; count: number }>;
  specializationDistribution: Array<{ specialization: string; count: number }>;
}

export interface AppointmentReport {
  totalAppointments: number;
  byStatus: Array<{ status: string; count: number }>;
  totalRevenue: number;
  totalPayments: number;
}

export interface AdminReviewListItem {
  id: string;
  rating: number;
  comment: string | null;
  doctorReply: string | null;
  isVisible: boolean;
  createdAt: string;
  patient: { firstName: string; lastName: string };
  doctor: { firstName: string; lastName: string };
}

export interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  user: { email: string; phone: string | null; createdAt: string };
}
