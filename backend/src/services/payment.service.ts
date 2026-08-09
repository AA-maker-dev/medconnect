import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';

// Helper to generate HMAC-SHA256 signature for eSewa
function generateEsewaSignature(secretKey: string, message: string): string {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
}

// Helper to generate SHA-512 signature for FonePay
function generateFonepaySignature(secretKey: string, message: string): string {
  const hmac = crypto.createHmac('sha512', secretKey);
  hmac.update(message);
  return hmac.digest('hex');
}

// Generate unique invoice number
function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
}

export async function initiatePayment(appointmentId: string, userId: string, gateway: 'ESEWA' | 'FONEPAY' | 'WALLET') {
  // 1. Fetch appointment details
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { include: { user: true } },
      doctor: true,
      payment: true,
    },
  });

  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }

  // Authorization check: patient who booked or admin
  if (appointment.patient.userId !== userId) {
    throw ApiError.forbidden('You are not authorized to pay for this appointment');
  }

  if (appointment.payment?.status === 'SUCCESS') {
    throw ApiError.badRequest('This appointment has already been paid for');
  }

  const feeAmount = Number(appointment.doctor.consultationFee);
  const formattedAmount = feeAmount.toFixed(2);

  if (gateway === 'WALLET') {
    return payWithWallet(appointmentId, userId);
  }

  if (gateway === 'ESEWA') {
    const merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    const successUrl = process.env.ESEWA_SUCCESS_URL || 'http://localhost:5173/payment/esewa/success';
    const failureUrl = process.env.ESEWA_FAILURE_URL || 'http://localhost:5173/payment/esewa/failure';
    const gatewayUrl = process.env.ESEWA_GATEWAY_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

    const transactionUuid = `EPAY-${appointment.id.slice(0, 8)}-${Date.now()}`;
    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    
    // eSewa signature message: total_amount=100.00,transaction_uuid=11-22-33,product_code=EPAYTEST
    const message = `total_amount=${formattedAmount},transaction_uuid=${transactionUuid},product_code=${merchantId}`;
    const signature = generateEsewaSignature(secretKey, message);

    // Create or update pending Payment record
    await prisma.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        amount: feeAmount,
        gateway: 'ESEWA',
        status: 'PENDING',
        gatewayTxnId: transactionUuid,
      },
      update: {
        amount: feeAmount,
        gateway: 'ESEWA',
        status: 'PENDING',
        gatewayTxnId: transactionUuid,
      },
    });

    return {
      gateway: 'ESEWA',
      gatewayUrl,
      params: {
        amount: formattedAmount,
        tax_amount: '0.00',
        total_amount: formattedAmount,
        transaction_uuid: transactionUuid,
        product_code: merchantId,
        product_service_charge: '0.00',
        product_delivery_charge: '0.00',
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: signedFieldNames,
        signature,
      },
    };
  }

  if (gateway === 'FONEPAY') {
    const merchantCode = process.env.FONEPAY_MERCHANT_CODE || 'NBQM';
    const secretKey = process.env.FONEPAY_SECRET_KEY || 'a7e3512f5032480a83137793cb2021dc';
    const returnUrl = process.env.FONEPAY_RETURN_URL || 'http://localhost:5173/payment/fonepay/callback';
    const gatewayUrl = process.env.FONEPAY_GATEWAY_URL || 'https://dev-clientapi.fonepay.com/api/merchantRequest';

    const prn = `FP-${appointment.id.slice(0, 8)}-${Date.now()}`;
    const dateStr = new Date().toLocaleDateString('en-US'); // MM/DD/YYYY

    // DV Signature string: PID,MD,PRN,AMT,CRN,DT,R1,R2,DV
    const dvMessage = `${merchantCode},P,${prn},${formattedAmount},NPR,${dateStr},Appointment Payment,MedConnect`;
    const dv = generateFonepaySignature(secretKey, dvMessage);

    await prisma.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        amount: feeAmount,
        gateway: 'FONEPAY',
        status: 'PENDING',
        gatewayTxnId: prn,
      },
      update: {
        amount: feeAmount,
        gateway: 'FONEPAY',
        status: 'PENDING',
        gatewayTxnId: prn,
      },
    });

    return {
      gateway: 'FONEPAY',
      gatewayUrl,
      params: {
        PID: merchantCode,
        MD: 'P',
        PRN: prn,
        AMT: formattedAmount,
        CRN: 'NPR',
        DT: dateStr,
        R1: 'Appointment Payment',
        R2: 'MedConnect',
        RU: returnUrl,
        DV: dv,
      },
    };
  }

  throw ApiError.badRequest('Invalid payment gateway');
}

export async function verifyEsewaPayment(encodedData: string) {
  try {
    const decodedBuffer = Buffer.from(encodedData, 'base64');
    const jsonStr = decodedBuffer.toString('utf-8');
    const payload = JSON.parse(jsonStr);

    const {
      status,
      signature,
      transaction_code,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
    } = payload;

    const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';

    // Verify signature if required signed fields are present
    if (signed_field_names && signature) {
      const fieldKeys = signed_field_names.split(',');
      const msgParts = fieldKeys.map((key: string) => `${key}=${payload[key]}`);
      const expectedMessage = msgParts.join(',');
      const expectedSignature = generateEsewaSignature(secretKey, expectedMessage);

      if (expectedSignature !== signature) {
        throw ApiError.badRequest('eSewa payment signature verification failed');
      }
    }

    if (status !== 'COMPLETE') {
      throw ApiError.badRequest(`eSewa payment failed with status: ${status}`);
    }

    // Find payment record by transactionUuid or match via appointment
    let payment = await prisma.payment.findFirst({
      where: { gatewayTxnId: transaction_uuid },
      include: { appointment: { include: { patient: true, doctor: { include: { user: true } } } } },
    });

    // Fallback search if transaction_uuid format matched appointment id prefix
    if (!payment && transaction_uuid.startsWith('EPAY-')) {
      const parts = transaction_uuid.split('-');
      const prefix = parts[1]; // short appointment id
      const candidateAppointments = await prisma.appointment.findMany({
        where: { id: { startsWith: prefix } },
        include: { payment: true, patient: true, doctor: { include: { user: true } } },
      });
      if (candidateAppointments.length > 0 && candidateAppointments[0].payment) {
        payment = candidateAppointments[0].payment as any;
      }
    }

    if (!payment) {
      throw ApiError.notFound('Payment record not found for transaction');
    }

    if (payment.status === 'SUCCESS') {
      return { success: true, payment, message: 'Payment already completed' };
    }

    // Fulfill payment transaction atomically
    const invoiceNumber = generateInvoiceNumber();
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gatewayRefId: transaction_code || transaction_uuid,
          rawResponse: payload as unknown as Prisma.InputJsonValue,
        },
      });

      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          appointmentId: payment.appointmentId,
          paymentId: payment.id,
          patientId: payment.appointment.patientId,
          subtotal: payment.amount,
          tax: new Prisma.Decimal(0),
          total: payment.amount,
        },
      });

      // Create notifications
      await tx.notification.create({
        data: {
          userId: payment.appointment.patient.userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Payment Successful',
          body: `Payment of NPR ${Number(payment.amount).toLocaleString()} for your appointment with Dr. ${payment.appointment.doctor.firstName} ${payment.appointment.doctor.lastName} was successful.`,
          data: { appointmentId: payment.appointmentId, invoiceId: invoice.id },
        },
      });

      await tx.notification.create({
        data: {
          userId: payment.appointment.doctor.userId,
          type: 'PAYMENT_SUCCESS',
          title: 'Appointment Payment Received',
          body: `Payment received from ${payment.appointment.patient.firstName} ${payment.appointment.patient.lastName} for appointment on ${new Date(payment.appointment.date).toLocaleDateString()}.`,
          data: { appointmentId: payment.appointmentId },
        },
      });

      return { payment: updatedPayment, invoice };
    });

    return { success: true, ...result };
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw ApiError.badRequest(`Failed to process eSewa callback: ${error.message}`);
  }
}

export async function verifyFonepayPayment(query: Record<string, any>) {
  const { PRN, PS, RC, UID, P_AMT, DV } = query;

  if (RC !== '200' && PS !== 'true' && PS !== 'SUCCESS') {
    throw ApiError.badRequest('FonePay payment was not successful');
  }

  const payment = await prisma.payment.findFirst({
    where: { gatewayTxnId: PRN },
    include: { appointment: { include: { patient: true, doctor: true } } },
  });

  if (!payment) {
    throw ApiError.notFound('Payment record not found for FonePay PRN');
  }

  if (payment.status === 'SUCCESS') {
    return { success: true, payment, message: 'Payment already completed' };
  }

  const invoiceNumber = generateInvoiceNumber();
  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        gatewayRefId: UID || PRN,
        rawResponse: query as unknown as Prisma.InputJsonValue,
      },
    });

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        appointmentId: payment.appointmentId,
        paymentId: payment.id,
        patientId: payment.appointment.patientId,
        subtotal: payment.amount,
        tax: new Prisma.Decimal(0),
        total: payment.amount,
      },
    });

    await tx.notification.create({
      data: {
        userId: payment.appointment.patient.userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        body: `Payment of NPR ${Number(payment.amount).toLocaleString()} via FonePay was successful.`,
        data: { appointmentId: payment.appointmentId, invoiceId: invoice.id },
      },
    });

    return { payment: updatedPayment, invoice };
  });

  return { success: true, ...result };
}

export async function payWithWallet(appointmentId: string, userId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { include: { user: true } },
      doctor: true,
      payment: true,
    },
  });

  if (!appointment) throw ApiError.notFound('Appointment not found');
  if (appointment.patient.userId !== userId) throw ApiError.forbidden('Unauthorized');
  if (appointment.payment?.status === 'SUCCESS') throw ApiError.badRequest('Appointment already paid');

  const feeAmount = Number(appointment.doctor.consultationFee);

  // Find user's wallet
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: new Prisma.Decimal(0) },
    });
  }

  if (Number(wallet.balance) < feeAmount) {
    throw ApiError.badRequest(`Insufficient wallet balance. Current balance is NPR ${Number(wallet.balance).toLocaleString()}, required NPR ${feeAmount.toLocaleString()}`);
  }

  const invoiceNumber = generateInvoiceNumber();

  // Execute wallet transaction atomically
  const result = await prisma.$transaction(async (tx) => {
    // 1. Deduct wallet balance
    const newBalance = Number(wallet.balance) - feeAmount;
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: new Prisma.Decimal(newBalance) },
    });

    // 2. Create WalletTransaction (DEBIT)
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEBIT',
        amount: new Prisma.Decimal(feeAmount),
        reason: `Appointment payment to Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
      },
    });

    // 3. Upsert Payment row
    const payment = await tx.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        amount: new Prisma.Decimal(feeAmount),
        gateway: 'WALLET',
        status: 'SUCCESS',
        gatewayTxnId: `WLT-${appointmentId.slice(0, 8)}-${Date.now()}`,
      },
      update: {
        amount: new Prisma.Decimal(feeAmount),
        gateway: 'WALLET',
        status: 'SUCCESS',
        gatewayTxnId: `WLT-${appointmentId.slice(0, 8)}-${Date.now()}`,
      },
    });

    // 4. Create Invoice
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        appointmentId,
        paymentId: payment.id,
        patientId: appointment.patientId,
        subtotal: new Prisma.Decimal(feeAmount),
        tax: new Prisma.Decimal(0),
        total: new Prisma.Decimal(feeAmount),
      },
    });

    // 5. Notifications
    await tx.notification.create({
      data: {
        userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Paid via Wallet',
        body: `NPR ${feeAmount.toLocaleString()} deducted from your wallet for appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}.`,
        data: { appointmentId, invoiceId: invoice.id },
      },
    });

    return { payment, invoice, remainingBalance: newBalance };
  });

  return { success: true, gateway: 'WALLET', ...result };
}

export async function topUpWallet(userId: string, amount: number, gateway: 'ESEWA' | 'FONEPAY' | 'WALLET' = 'WALLET') {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: new Prisma.Decimal(0) },
    });
  }

  const newBalance = Number(wallet.balance) + amount;

  const result = await prisma.$transaction(async (tx) => {
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: new Prisma.Decimal(newBalance) },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount: new Prisma.Decimal(amount),
        reason: `Wallet Top-Up (${gateway})`,
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Wallet Top-Up Successful',
        body: `NPR ${amount.toLocaleString()} has been added to your MedConnect wallet. New balance: NPR ${newBalance.toLocaleString()}.`,
      },
    });

    return { wallet: updatedWallet, transaction };
  });

  return { success: true, balance: newBalance, transaction: result.transaction };
}
