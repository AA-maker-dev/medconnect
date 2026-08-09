import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import * as paymentController from '../controllers/payment.controller';
import {
  initiatePaymentSchema,
  verifyEsewaSchema,
  verifyFonepaySchema,
  payWithWalletSchema,
  topUpWalletSchema,
} from '../validators/payment.validator';

const router = Router();

// ---- Initiate Payment (Authenticated Patients) ----
router.post(
  '/initiate',
  authenticate,
  authorize('PATIENT'),
  validate(initiatePaymentSchema),
  paymentController.initiatePayment
);

// ---- Callback & Verification Endpoints (Public for Gateways) ----
router.get('/esewa/verify', validate(verifyEsewaSchema), paymentController.verifyEsewa);
router.post('/esewa/verify', paymentController.verifyEsewa);

router.get('/fonepay/verify', validate(verifyFonepaySchema), paymentController.verifyFonepay);
router.post('/fonepay/verify', paymentController.verifyFonepay);

// ---- Wallet Endpoints ----
router.post(
  '/wallet/pay',
  authenticate,
  authorize('PATIENT'),
  validate(payWithWalletSchema),
  paymentController.payWithWallet
);

router.post(
  '/wallet/topup',
  authenticate,
  validate(topUpWalletSchema),
  paymentController.topUpWallet
);

export default router;
