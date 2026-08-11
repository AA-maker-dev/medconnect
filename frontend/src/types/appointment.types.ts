export interface Disease {
  id: string;
  name: string;
  description: string | null;
  specialization: { id: string; name: string };
}

export interface RecommendedDoctor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  qualification: string;
  experienceYears: number;
  consultationFee: string;
  ratingAvg: string;
  ratingCount: number;
  languages: string[];
  specialization: { id: string; name: string };
  hospital: { id: string; name: string; city: string } | null;
  matchScore: number;
  matchReasons: string[];
}

export interface RecommendedDoctorsResult {
  specialization: { id: string; name: string };
  doctors: RecommendedDoctor[];
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

export type ConsultationType = 'IN_PERSON' | 'VIDEO';

export interface BookAppointmentPayload {
  doctorId: string;
  diseaseId?: string;
  date: string;
  startTime: string;
  endTime: string;
  consultationType: ConsultationType;
  reasonForVisit?: string;
}

export interface RescheduleAppointmentPayload {
  appointmentId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  consultationType: ConsultationType;
  reasonForVisit?: string;
}

export interface BookedAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  consultationType: ConsultationType;
  reasonForVisit: string | null;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    qualification: string;
    consultationFee: string;
    specialization: { id: string; name: string };
    hospital: { id: string; name: string; city: string } | null;
  };
}

export interface AppointmentDetail extends BookedAppointment {
  patient: { userId: string; firstName: string; lastName: string };
  disease: { id: string; name: string } | null;
}
