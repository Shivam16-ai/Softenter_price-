import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiResponse';
import * as paymentService from '../services/paymentService';
import { PaymentMethod } from '../../shared/types';

export const processPaymentHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { parcel_id, payment_method = 'card' } = req.body;

    if (!parcel_id) {
      return sendError(res, 'Parcel ID is required for payment', 400);
    }

    const result = paymentService.processPayment(
      parcel_id,
      user.id,
      payment_method as PaymentMethod,
      user
    );

    return sendSuccess(res, result, 'Payment authorized and settled successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Payment processing failed', 400);
  }
};

export const getPaymentsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const payments = paymentService.getPaymentsForUser(user.id, user.role);
    return sendSuccess(res, payments, 'Payment records retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch payments', 500);
  }
};

export const getInvoiceHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { parcelId } = req.params;
    const invoice = paymentService.getInvoiceData(parcelId);

    if (!invoice) {
      return sendError(res, 'Invoice not found for this shipment', 404);
    }

    return sendSuccess(res, invoice, 'Invoice generated successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to generate invoice', 500);
  }
};
