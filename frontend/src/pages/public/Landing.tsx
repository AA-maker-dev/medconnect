import { HeroSection } from '@/components/landing/HeroSection';
import { PopularDepartments } from '@/components/landing/PopularDepartments';
import { DoctorShowcaseSection } from '@/components/landing/DoctorShowcaseSection';
import { StatisticsSection } from '@/components/landing/StatisticsSection';
import { HospitalPartnersSection } from '@/components/landing/HospitalPartnersSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { HealthTipsSection } from '@/components/landing/HealthTipsSection';
import { EmergencyContactSection } from '@/components/landing/EmergencyContactSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { NewsletterSection } from '@/components/landing/NewsletterSection';

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      <EmergencyContactSection />

      <PopularDepartments />

      <DoctorShowcaseSection
        title="Top rated doctors"
        subtitle="Ranked by real patient ratings and completed appointments."
        sortBy="rating"
        tone="ivory"
      />

      <DoctorShowcaseSection
        title="Featured specialists"
        subtitle="One highly-rated doctor from each department, so you can see the range of care available."
        sortBy="rating"
        uniqueBySpecialization
      />

      <StatisticsSection />

      <DoctorShowcaseSection
        title="Recently joined doctors"
        subtitle="New verified specialists who just joined MedConnect."
        sortBy="recent"
        tone="ivory"
      />

      <HospitalPartnersSection />

      <TestimonialsSection />

      <HealthTipsSection />

      <FAQSection />

      <NewsletterSection />
    </>
  );
}
