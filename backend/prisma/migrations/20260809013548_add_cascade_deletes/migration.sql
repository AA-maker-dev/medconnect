-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_patientId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_patientId_fkey";

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
