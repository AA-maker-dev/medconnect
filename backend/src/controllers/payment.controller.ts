import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import * as paymentService from '../services/payment.service';

export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId, gateway } = req.body;
  const result = await paymentService.initiatePayment(appointmentId, req.user!.id, gateway);
  sendSuccess(res, 200, 'Payment initiation payload generated', result);
});

export const verifyEsewa = asyncHandler(async (req: Request, res: Response) => {
  const data = (req.query.data as string) || (req.body.data as string);
  const result = await paymentService.verifyEsewaPayment(data);
  sendSuccess(res, 200, 'eSewa payment verified successfully', result);
});

export const verifyFonepay = asyncHandler(async (req: Request, res: Response) => {
  const query = Object.keys(req.query).length ? req.query : req.body;
  const result = await paymentService.verifyFonepayPayment(query);
  sendSuccess(res, 200, 'FonePay payment verified successfully', result);
});

export const payWithWallet = asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.body;
  const result = await paymentService.payWithWallet(appointmentId, req.user!.id);
  sendSuccess(res, 200, 'Payment via wallet successful', result);
});

export const topUpWallet = asyncHandler(async (req: Request, res: Response) => {
  const { amount, gateway } = req.body;
  const result = await paymentService.topUpWallet(req.user!.id, amount, gateway);
  sendSuccess(res, 200, 'Wallet top-up successful', result);
});
