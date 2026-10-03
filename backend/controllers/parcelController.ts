import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiResponse';
import * as parcelService from '../services/parcelService';
import { ParcelStatus } from '../../shared/types';

export const createParcelHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      recipient_name,
      recipient_phone,
      recipient_email,
      pickup_address,
      delivery_address,
      weight_kg,
      dimensions,
      parcel_type = 'standard',
      special_instructions,
    } = req.body;

    if (!recipient_name || !recipient_phone || !pickup_address || !delivery_address || !weight_kg) {
      return sendError(res, 'Missing essential parcel shipment details', 422);
    }

    const parcel = parcelService.createParcel(
      {
        sender_id: user.id,
        sender_name: user.full_name,
        recipient_name,
        recipient_phone,
        recipient_email,
        pickup_address,
        delivery_address,
        weight_kg: parseFloat(weight_kg),
        dimensions,
        parcel_type,
        special_instructions,
      },
      user
    );

    return sendSuccess(res, parcel, 'Shipment booked successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to book parcel', 500);
  }
};

export const getParcelsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { status, search } = req.query;

    const parcels = parcelService.getParcels({
      userId: user.id,
      role: user.role,
      agentId: user.id,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
    });

    return sendSuccess(res, parcels, 'Parcels retrieved successfully', 200, { total: parcels.length });
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch parcels', 500);
  }
};

export const getParcelByIdHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = parcelService.getParcelById(id);

    if (!data) {
      return sendError(res, 'Parcel not found', 404);
    }

    // Role boundary checks: customers can only view their parcels unless admin/agent
    const user = req.user!;
    if (user.role === 'customer' && data.parcel.sender_id !== user.id) {
      return sendError(res, 'You do not have authorization to view this parcel record', 403);
    }

    return sendSuccess(res, data);
  } catch (err: any) {
    return sendError(res, err.message || 'Error retrieving parcel', 500);
  }
};

export const updateStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status, location, description } = req.body;

    if (!status) {
      return sendError(res, 'New parcel status is required', 400);
    }

    const updated = parcelService.updateParcelStatus(
      id,
      status as ParcelStatus,
      location || 'Regional Transit Point',
      description,
      user
    );

    if (!updated) {
      return sendError(res, 'Parcel not found or update failed', 404);
    }

    return sendSuccess(res, updated, `Parcel status updated to ${status}`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update status', 500);
  }
};

export const assignAgentHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { agent_id } = req.body;

    if (!agent_id) {
      return sendError(res, 'Agent ID is required for courier dispatch', 400);
    }

    const parcel = parcelService.assignAgent(id, agent_id, user);
    if (!parcel) {
      return sendError(res, 'Parcel not found', 404);
    }

    return sendSuccess(res, parcel, 'Courier agent assigned successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to assign agent', 500);
  }
};

export const submitProofHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { recipient_name, signature_url, photo_url, notes } = req.body;

    const proof = parcelService.recordDeliveryProof(id, user, {
      recipient_name,
      signature_url,
      photo_url,
      notes,
    });

    return sendSuccess(res, proof, 'Delivery proof recorded and confirmed', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to submit delivery proof', 500);
  }
};
