import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/shared/PublicOnlyRoute';
import { PublicLayout } from '@/layouts/PublicLayout';

import LandingPage from '@/pages/public/Landing';
import LoginPage from '@/pages/auth/Login';
import AdminLoginPage from '@/pages/auth/AdminLogin';
import RegisterChoicePage from '@/pages/auth/RegisterChoice';
import RegisterPatientPage from '@/pages/auth/RegisterPatient';
import RegisterDoctorPage from '@/pages/auth/RegisterDoctor';
import VerifyOtpPage from '@/pages/auth/VerifyOtp';
import ForgotPasswordPage from '@/pages/auth/ForgotPassword';
import ResetPasswordPage from '@/pages/auth/ResetPassword';

import { PatientDashboardLayout } from '@/layouts/PatientDashboardLayout';
import PatientDashboardPage from '@/pages/patient/Dashboard';
import PatientAppointmentsPage from '@/pages/patient/Appointments';
import MedicalHistoryPage from '@/pages/patient/MedicalHistory';
import FavoriteDoctorsPage from '@/pages/patient/FavoriteDoctors';
import PrescriptionsPage from '@/pages/patient/Prescriptions';
import InvoicesPage from '@/pages/patient/Invoices';
import WalletPage from '@/pages/patient/Wallet';
import NotificationsPage from '@/pages/patient/Notifications';
import PatientProfilePage from '@/pages/patient/Profile';
import PatientSettingsPage from '@/pages/patient/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

// Full doctor directory / search / about / contact pages are content-heavy
// enough to be their own phase-4-adjacent work; these placeholders keep
// every nav link in the Phase 3 navbar/footer from dead-ending at "/".
function PublicPagePlaceholder({ label }: { label: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center font-body text-slate-500 px-6 text-center">
      {label} page is coming in a later phase.
    </div>
  );
}

// Placeholders so ProtectedRoute has somewhere real to send each role
// until Phases 4–6 build the actual dashboards.
function DashboardPlaceholder({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory-50 font-body text-slate-700">
      {label} dashboard arrives in a later phase.
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public site — navbar + footer + mobile bottom nav */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/doctors" element={<PublicPagePlaceholder label="Doctor directory" />} />
                  <Route path="/specialties" element={<PublicPagePlaceholder label="Specialties" />} />
                  <Route path="/about" element={<PublicPagePlaceholder label="About" />} />
                  <Route path="/contact" element={<PublicPagePlaceholder label="Contact" />} />
                  <Route path="/search" element={<PublicPagePlaceholder label="Search results" />} />
                </Route>

                {/* Auth pages — redirect away if already logged in */}
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/register" element={<RegisterChoicePage />} />
                  <Route path="/register/patient" element={<RegisterPatientPage />} />
                  <Route path="/register/doctor" element={<RegisterDoctorPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* OTP verification is reachable regardless of auth state */}
                <Route path="/verify-otp" element={<VerifyOtpPage />} />

                {/* Role-gated dashboards */}
                <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
                  <Route path="/patient" element={<PatientDashboardLayout />}>
                    <Route path="dashboard" element={<PatientDashboardPage />} />
                    <Route path="appointments" element={<PatientAppointmentsPage />} />
                    <Route path="medical-history" element={<MedicalHistoryPage />} />
                    <Route path="favorite-doctors" element={<FavoriteDoctorsPage />} />
                    <Route path="prescriptions" element={<PrescriptionsPage />} />
                    <Route path="invoices" element={<InvoicesPage />} />
                    <Route path="wallet" element={<WalletPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="profile" element={<PatientProfilePage />} />
                    <Route path="settings" element={<PatientSettingsPage />} />
                  </Route>
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
                  <Route
                    path="/doctor/dashboard"
                    element={<DashboardPlaceholder label="Doctor" />}
                  />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route
                    path="/admin/dashboard"
                    element={<DashboardPlaceholder label="Admin" />}
                  />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
