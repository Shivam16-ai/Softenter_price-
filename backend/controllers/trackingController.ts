import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import * as parcelService from '../services/parcelService';

export const trackParcel = async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      return sendError(res, 'Tracking number is required', 400);
    }

    const data = parcelService.getParcelByTrackingNumber(trackingNumber);

    if (!data) {
      return sendError(res, `No consignment found with tracking number "${trackingNumber}". Please check the number and retry.`, 404);
    }

    return sendSuccess(res, data, 'Tracking details retrieved');
  } catch (err: any) {
    return sendError(res, err.message || 'Error tracking parcel', 500);
  }
};
