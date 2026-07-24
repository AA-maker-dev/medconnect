/**
 * Seed script — specializations, diseases, and demo content.
 *
 * Specializations/diseases power the Smart Doctor Recommendation system
 * (Phase 7). The hospitals/doctors/patients/reviews below exist purely so
 * the Phase 3 landing page (top-rated doctors, recently joined, hospital
 * partners, testimonials) has real data to render in development — none
 * of this is required in production, where real signups populate it.
 *
 * Run with: npm run prisma:seed .
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SPECIALIZATIONS: Array<{
  name: string;
  description: string;
  diseases: string[];
}> = [
  {
    name: 'Cardiologist',
    description: 'Heart and cardiovascular system specialist.',
    diseases: ['Heart Disease', 'Hypertension', 'Arrhythmia', 'Chest Pain'],
  },
  {
    name: 'Dermatologist',
    description: 'Skin, hair, and nail specialist.',
    diseases: ['Skin Disease', 'Acne', 'Eczema', 'Psoriasis', 'Hair Loss'],
  },
  {
    name: 'Dentist',
    description: 'Oral and dental health specialist.',
    diseases: ['Dental Problem', 'Tooth Decay', 'Gum Disease'],
  },
  {
    name: 'Neurologist',
    description: 'Brain and nervous system specialist.',
    diseases: ['Migraine', 'Epilepsy', 'Stroke', 'Nerve Pain'],
  },
  {
    name: 'Orthopedic Surgeon',
    description: 'Bones, joints, and musculoskeletal specialist.',
    diseases: ['Fracture', 'Arthritis', 'Back Pain', 'Sports Injury'],
  },
  {
    name: 'Pediatrician',
    description: 'Child health specialist.',
    diseases: ['Childhood Fever', 'Growth Concerns', 'Vaccination'],
  },
  {
    name: 'Gynecologist',
    description: "Women's reproductive health specialist.",
    diseases: ['Pregnancy Care', 'Menstrual Disorder', 'PCOS'],
  },
  {
    name: 'Psychiatrist',
    description: 'Mental health specialist.',
    diseases: ['Anxiety', 'Depression', 'Insomnia'],
  },
  {
    name: 'General Physician',
    description: 'Primary care and general health.',
    diseases: ['Common Cold', 'Fever', 'Diabetes', 'General Checkup'],
  },
  {
    name: 'ENT Specialist',
    description: 'Ear, nose, and throat specialist.',
    diseases: ['Sinusitis', 'Ear Infection', 'Throat Infection'],
  },
];

const HOSPITALS = [
  { name: 'Norvic International Hospital', city: 'Kathmandu' },
  { name: 'Grande International Hospital', city: 'Kathmandu' },
  { name: 'Patan Academy of Health Sciences', city: 'Lalitpur' },
  { name: 'B&B Hospital', city: 'Lalitpur' },
  { name: 'Kathmandu Model Hospital', city: 'Kathmandu' },
];

interface DemoDoctor {
  firstName: string;
  lastName: string;
  email: string;
  specializationName: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  licenseNumber: string;
  hospitalName: string;
  bio: string;
  ratingAvg: number;
  ratingCount: number;
  totalPatients: number;
  languages: string[];
}

const DEMO_DOCTORS: DemoDoctor[] = [
  {
    firstName: 'Anjali',
    lastName: 'Shrestha',
    email: 'anjali.shrestha@medconnect.demo',
    specializationName: 'Cardiologist',
    qualification: 'MBBS, MD (Cardiology)',
    experienceYears: 14,
    consultationFee: 1500,
    licenseNumber: 'NMC-10234',
    hospitalName: 'Norvic International Hospital',
    bio: 'Specializes in interventional cardiology and preventive heart care.',
    ratingAvg: 4.9,
    ratingCount: 212,
    totalPatients: 3400,
    languages: ['English', 'Nepali', 'Hindi'],
  },
  {
    firstName: 'Rajesh',
    lastName: 'Koirala',
    email: 'rajesh.koirala@medconnect.demo',
    specializationName: 'Dermatologist',
    qualification: 'MBBS, MD (Dermatology)',
    experienceYears: 9,
    consultationFee: 1200,
    licenseNumber: 'NMC-10567',
    hospitalName: 'Grande International Hospital',
    bio: 'Focuses on acne, eczema, and cosmetic dermatology.',
    ratingAvg: 4.8,
    ratingCount: 156,
    totalPatients: 2100,
    languages: ['English', 'Nepali'],
  },
  {
    firstName: 'Sunita',
    lastName: 'Rai',
    email: 'sunita.rai@medconnect.demo',
    specializationName: 'Pediatrician',
    qualification: 'MBBS, DCH',
    experienceYears: 11,
    consultationFee: 1000,
    licenseNumber: 'NMC-10891',
    hospitalName: 'Patan Academy of Health Sciences',
    bio: "Dedicated to children's health from infancy through adolescence.",
    ratingAvg: 4.9,
    ratingCount: 289,
    totalPatients: 4200,
    languages: ['English', 'Nepali', 'Newari'],
  },
  {
    firstName: 'Bikash',
    lastName: 'Thapa',
    email: 'bikash.thapa@medconnect.demo',
    specializationName: 'Orthopedic Surgeon',
    qualification: 'MBBS, MS (Orthopedics)',
    experienceYears: 16,
    consultationFee: 1800,
    licenseNumber: 'NMC-9982',
    hospitalName: 'B&B Hospital',
    bio: 'Specializes in sports injuries and joint replacement surgery.',
    ratingAvg: 4.7,
    ratingCount: 134,
    totalPatients: 1900,
    languages: ['English', 'Nepali'],
  },
  {
    firstName: 'Priya',
    lastName: 'Maharjan',
    email: 'priya.maharjan@medconnect.demo',
    specializationName: 'Gynecologist',
    qualification: 'MBBS, MD (Obstetrics & Gynecology)',
    experienceYears: 13,
    consultationFee: 1400,
    licenseNumber: 'NMC-10345',
    hospitalName: 'Kathmandu Model Hospital',
    bio: "Women's health specialist covering prenatal to postnatal care.",
    ratingAvg: 4.9,
    ratingCount: 198,
    totalPatients: 2800,
    languages: ['English', 'Nepali'],
  },
  {
    firstName: 'Dipesh',
    lastName: 'Gurung',
    email: 'dipesh.gurung@medconnect.demo',
    specializationName: 'General Physician',
    qualification: 'MBBS',
    experienceYears: 6,
    consultationFee: 700,
    licenseNumber: 'NMC-11203',
    hospitalName: 'Grande International Hospital',
    bio: 'Primary care physician for everyday health concerns and checkups.',
    ratingAvg: 4.6,
    ratingCount: 87,
    totalPatients: 1500,
    languages: ['English', 'Nepali'],
  },
];

const DEMO_PATIENTS = [
  { firstName: 'Sabina', lastName: 'Adhikari', email: 'sabina.adhikari@medconnect.demo' },
  { firstName: 'Nabin', lastName: 'Basnet', email: 'nabin.basnet@medconnect.demo' },
  { firstName: 'Kritika', lastName: 'Sharma', email: 'kritika.sharma@medconnect.demo' },
];

const DEMO_PASSWORD = 'DemoPass123'; // seed accounts only — never used for real users

async function seedSpecializationsAndDiseases() {
  console.log('Seeding specializations and diseases...');

  for (const spec of SPECIALIZATIONS) {
    const created = await prisma.specialization.upsert({
      where: { name: spec.name },
      update: { description: spec.description },
      create: { name: spec.name, description: spec.description },
    });

    for (const diseaseName of spec.diseases) {
      await prisma.disease.upsert({
        where: { name: diseaseName },
        update: { specializationId: created.id },
        create: { name: diseaseName, specializationId: created.id },
      });
    }

    console.log(`  ✓ ${spec.name} (${spec.diseases.length} diseases)`);
  }
}

async function seedHospitals() {
  console.log('Seeding hospitals...');
  const hospitalMap = new Map<string, string>();

  for (const h of HOSPITALS) {
    const existing = await prisma.hospital.findFirst({ where: { name: h.name } });
    const hospital =
      existing ??
      (await prisma.hospital.create({ data: { name: h.name, city: h.city, address: h.city } }));
    hospitalMap.set(h.name, hospital.id);
    console.log(`  ✓ ${h.name}`);
  }

  return hospitalMap;
}

async function seedDemoDoctors(hospitalMap: Map<string, string>) {
  console.log('Seeding demo doctors (verified, for landing page content)...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const doctorIds: string[] = [];

  for (const d of DEMO_DOCTORS) {
    const specialization = await prisma.specialization.findUnique({
      where: { name: d.specializationName },
    });
    if (!specialization) continue;

    const existingUser = await prisma.user.findUnique({ where: { email: d.email } });
    if (existingUser) {
      const doctor = await prisma.doctor.findUnique({ where: { userId: existingUser.id } });
      if (doctor) doctorIds.push(doctor.id);
      console.log(`  · ${d.firstName} ${d.lastName} already exists, skipping`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: d.email,
        passwordHash,
        role: 'DOCTOR',
        isEmailVerified: true,
        wallet: { create: { balance: 0 } },
        doctor: {
          create: {
            firstName: d.firstName,
            lastName: d.lastName,
            qualification: d.qualification,
            experienceYears: d.experienceYears,
            consultationFee: d.consultationFee,
            licenseNumber: d.licenseNumber,
            specializationId: specialization.id,
            hospitalId: hospitalMap.get(d.hospitalName),
            bio: d.bio,
            languages: d.languages,
            verificationStatus: 'VERIFIED',
            ratingAvg: d.ratingAvg,
            ratingCount: d.ratingCount,
            totalPatients: d.totalPatients,
          },
        },
      },
      include: { doctor: true },
    });

    if (user.doctor) doctorIds.push(user.doctor.id);
    console.log(`  ✓ Dr. ${d.firstName} ${d.lastName} (${d.specializationName})`);
  }

  return doctorIds;
}

async function seedDemoPatients() {
  console.log('Seeding demo patients...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const patientIds: string[] = [];

  for (const p of DEMO_PATIENTS) {
    const existingUser = await prisma.user.findUnique({ where: { email: p.email } });
    if (existingUser) {
      const patient = await prisma.patient.findUnique({ where: { userId: existingUser.id } });
      if (patient) patientIds.push(patient.id);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash,
        role: 'PATIENT',
        isEmailVerified: true,
        wallet: { create: { balance: 0 } },
        patient: { create: { firstName: p.firstName, lastName: p.lastName } },
      },
      include: { patient: true },
    });

    if (user.patient) patientIds.push(user.patient.id);
    console.log(`  ✓ ${p.firstName} ${p.lastName}`);
  }

  return patientIds;
}

const TESTIMONIAL_COMMENTS = [
  'The booking process was so simple, and Dr. really took the time to explain everything clearly.',
  'I was able to get an appointment the same day. The follow-up messages after my visit were a nice touch.',
  'Finally a portal where I can actually message my doctor about how my prescription is working.',
  'Professional, on time, and the video option saved me a trip across the city.',
  'My kids actually look forward to their checkups now. Great with children.',
  'Clear answers, no rush, and I could download my prescription right after the visit.',
];

async function seedDemoReviews(doctorIds: string[], patientIds: string[]) {
  if (doctorIds.length === 0 || patientIds.length === 0) return;
  console.log('Seeding demo appointments + reviews (for testimonials)...');

  let count = 0;
  for (let i = 0; i < doctorIds.length; i++) {
    const doctorId = doctorIds[i];
    const patientId = patientIds[i % patientIds.length];

    const existingAppointment = await prisma.appointment.findFirst({
      where: { doctorId, patientId, status: 'COMPLETED' },
    });
    if (existingAppointment) continue;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '10:30',
        status: 'COMPLETED',
        consultationType: 'IN_PERSON',
      },
    });

    await prisma.review.create({
      data: {
        appointmentId: appointment.id,
        patientId,
        doctorId,
        rating: 5,
        comment: TESTIMONIAL_COMMENTS[i % TESTIMONIAL_COMMENTS.length],
      },
    });

    count++;
  }
  console.log(`  ✓ ${count} demo reviews created`);
}

async function seedPatientDashboardContent(doctorIds: string[], patientIds: string[]) {
  if (doctorIds.length < 2 || patientIds.length === 0) return;
  console.log('Seeding patient dashboard content (favorites, history, prescriptions, invoices)...');

  const primaryPatientId = patientIds[0];
  const [doctorA, doctorB] = doctorIds;

  // Favorite doctor
  await prisma.favoriteDoctor.upsert({
    where: { patientId_doctorId: { patientId: primaryPatientId, doctorId: doctorB } },
    update: {},
    create: { patientId: primaryPatientId, doctorId: doctorB },
  });

  // Medical history entry
  const existingHistory = await prisma.medicalHistory.findFirst({
    where: { patientId: primaryPatientId, title: 'Seasonal allergy diagnosis' },
  });
  if (!existingHistory) {
    await prisma.medicalHistory.create({
      data: {
        patientId: primaryPatientId,
        title: 'Seasonal allergy diagnosis',
        description: 'Mild seasonal allergic rhinitis, managed with antihistamines.',
      },
    });
  }

  // Upcoming appointment (pending admin/doctor approval flow, visible on dashboard)
  const existingUpcoming = await prisma.appointment.findFirst({
    where: { patientId: primaryPatientId, doctorId: doctorA, status: 'APPROVED' },
  });
  if (!existingUpcoming) {
    await prisma.appointment.create({
      data: {
        patientId: primaryPatientId,
        doctorId: doctorA,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        startTime: '11:00',
        endTime: '11:30',
        status: 'APPROVED',
        consultationType: 'IN_PERSON',
        reasonForVisit: 'Routine follow-up',
      },
    });

    await prisma.notification.create({
      data: {
        userId: (await prisma.patient.findUnique({ where: { id: primaryPatientId } }))!.userId,
        type: 'APPOINTMENT_APPROVED',
        title: 'Appointment approved',
        body: 'Your upcoming appointment has been approved by the doctor.',
      },
    });
  }

  // Prescription + invoice + payment on top of the COMPLETED appointment
  // created during testimonial seeding (patientIds[0] paired with doctorIds[0]).
  const completedAppointment = await prisma.appointment.findFirst({
    where: { patientId: primaryPatientId, doctorId: doctorA, status: 'COMPLETED' },
  });

  if (completedAppointment) {
    const existingPrescription = await prisma.prescription.findUnique({
      where: { appointmentId: completedAppointment.id },
    });

    if (!existingPrescription) {
      await prisma.prescription.create({
        data: {
          appointmentId: completedAppointment.id,
          doctorId: doctorA,
          diagnosis: 'Mild seasonal allergic rhinitis',
          advice: 'Stay hydrated, avoid known allergens, follow up in 3 months if symptoms persist.',
          medicines: {
            create: [
              {
                name: 'Cetirizine 10mg',
                dosage: '1 tablet',
                frequency: 'Once daily at night',
                durationDays: 14,
                instructions: 'Take after dinner',
              },
            ],
          },
        },
      });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { appointmentId: completedAppointment.id },
    });

    if (!existingInvoice) {
      const payment = await prisma.payment.create({
        data: {
          appointmentId: completedAppointment.id,
          amount: 1500,
          gateway: 'ESEWA',
          status: 'SUCCESS',
          gatewayTxnId: `DEMO-TXN-${completedAppointment.id.slice(0, 8)}`,
        },
      });

      await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${completedAppointment.id.slice(0, 8).toUpperCase()}`,
          appointmentId: completedAppointment.id,
          paymentId: payment.id,
          patientId: primaryPatientId,
          subtotal: 1500,
          tax: 0,
          total: 1500,
        },
      });
    }
  }

  // Wallet welcome bonus
  const patientUser = await prisma.patient.findUnique({
    where: { id: primaryPatientId },
    select: { userId: true },
  });
  if (patientUser) {
    const wallet = await prisma.wallet.findUnique({ where: { userId: patientUser.userId } });
    if (wallet && Number(wallet.balance) === 0) {
      await prisma.wallet.update({
        where: { userId: patientUser.userId },
        data: { balance: 200 },
      });
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: 200,
          reason: 'Welcome bonus',
        },
      });
    }
  }

  console.log('  ✓ Dashboard demo content seeded for first demo patient');
}

async function seedDoctorDashboardContent(doctorIds: string[], patientIds: string[]) {
  if (doctorIds.length < 2 || patientIds.length === 0) return;
  console.log('Seeding doctor dashboard content (availability, appointment requests)...');

  const [doctorA, doctorB] = doctorIds;

  // Weekly availability, Mon–Fri 9am–5pm, for the first two demo doctors
  for (const doctorId of [doctorA, doctorB]) {
    const existing = await prisma.doctorAvailability.findFirst({ where: { doctorId } });
    if (existing) continue;

    for (let day = 1; day <= 5; day++) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 30,
          isActive: true,
        },
      });
    }
  }

  // A pending appointment request so the "Appointment Requests" card has
  // something to approve/reject on first login.
  const secondaryPatientId = patientIds[1 % patientIds.length];
  const existingRequest = await prisma.appointment.findFirst({
    where: { doctorId: doctorA, patientId: secondaryPatientId, status: 'PENDING' },
  });
  if (!existingRequest) {
    await prisma.appointment.create({
      data: {
        patientId: secondaryPatientId,
        doctorId: doctorA,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        startTime: '14:00',
        endTime: '14:30',
        status: 'PENDING',
        consultationType: 'IN_PERSON',
        reasonForVisit: 'Persistent headache for the past week',
      },
    });
  }

  console.log('  ✓ Availability and appointment requests seeded');
}

async function main() {
  await seedSpecializationsAndDiseases();
  const hospitalMap = await seedHospitals();
  const doctorIds = await seedDemoDoctors(hospitalMap);
  const patientIds = await seedDemoPatients();
  await seedDemoReviews(doctorIds, patientIds);
  await seedPatientDashboardContent(doctorIds, patientIds);
  await seedDoctorDashboardContent(doctorIds, patientIds);

  console.log('Seed complete.');
  console.log(`Demo account password for all seeded users: ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
