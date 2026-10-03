import { db } from '../database/connection';
import { ReturnRequest, ReturnStatus, ReturnReason, ExternalPlatform, User } from '../../shared/types';
import { logActivity } from './activityService';
import { realtimeService } from './realtimeService';

export interface CreateReturnRequestDTO {
  customer_id: string;
  parcel_id?: string;
  external_order_id?: string;
  product_name: string;
  order_platform?: ExternalPlatform;
  order_reference?: string;
  reason: ReturnReason;
  reason_description?: string;
  pickup_address: string;
  pickup_city?: string;
  pickup_postal_code?: string;
  preferred_pickup_date?: string;
  notes?: string;
}

const generateReturnNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RET-${timestamp}-${random}`;
};

export const createReturnRequest = (dto: CreateReturnRequestDTO, user?: User): ReturnRequest => {
  if (!dto.parcel_id && !dto.external_order_id) {
    throw new Error('Either parcel_id or external_order_id must be provided');
  }

  const returnNumber = generateReturnNumber();

  const newReturn: ReturnRequest = {
    id: `ret_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    return_number: returnNumber,
    customer_id: dto.customer_id,
    parcel_id: dto.parcel_id,
    external_order_id: dto.external_order_id,
    product_name: dto.product_name,
    order_platform: dto.order_platform,
    order_reference: dto.order_reference,
    reason: dto.reason,
    reason_description: dto.reason_description,
    status: 'requested',
    pickup_address: dto.pickup_address,
    pickup_city: dto.pickup_city,
    pickup_postal_code: dto.pickup_postal_code,
    preferred_pickup_date: dto.preferred_pickup_date,
    notes: dto.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.insert('return_requests', newReturn);

  logActivity(
    user || null,
    'RETURN_REQUESTED',
    'return_request',
    newReturn.id,
    `Return request ${returnNumber} created for ${dto.product_name}. Reason: ${dto.reason}`
  );

  return newReturn;
};

export const getReturnRequests = (filters: {
  customerId?: string;
  status?: string;
  agentId?: string;
}): ReturnRequest[] => {
  let returns = db.getTable('return_requests');

  if (filters.customerId) {
    returns = returns.filter((r: any) => r.customer_id === filters.customerId);
  }

  if (filters.agentId) {
    returns = returns.filter((r: any) => r.assigned_agent_id === filters.agentId);
  }

  if (filters.status && filters.status !== 'all') {
    returns = returns.filter((r: any) => r.status === filters.status);
  }

  return [...returns].sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const getReturnRequestById = (returnId: string): ReturnRequest | null => {
  return db.getTable('return_requests').find((r: any) => r.id === returnId) || null;
};

export const updateReturnStatus = (
  returnId: string,
  newStatus: ReturnStatus,
  additionalData?: {
    assigned_agent_id?: string;
    pickup_proof_url?: string;
    warehouse_received_at?: string;
    refund_amount?: number;
    refund_processed_at?: string;
    rejection_reason?: string;
  },
  user?: User
): ReturnRequest | null => {
  const updateData: any = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (additionalData?.assigned_agent_id) {
    updateData.assigned_agent_id = additionalData.assigned_agent_id;
    updateData.assigned_at = new Date().toISOString();
  }

  if (additionalData?.pickup_proof_url) {
    updateData.pickup_proof_url = additionalData.pickup_proof_url;
  }

  if (additionalData?.warehouse_received_at) {
    updateData.warehouse_received_at = additionalData.warehouse_received_at;
  }

  if (additionalData?.refund_amount) {
    updateData.refund_amount = additionalData.refund_amount;
  }

  if (additionalData?.refund_processed_at) {
    updateData.refund_processed_at = additionalData.refund_processed_at;
  }

  if (additionalData?.rejection_reason) {
    updateData.rejection_reason = additionalData.rejection_reason;
  }

  const updated = db.update('return_requests', returnId, updateData);

  if (updated) {
    // Send real-time update to customer
    realtimeService.notifyCustomer(updated.customer_id, 'return_status_update', {
      returnRequest: updated,
      timestamp: new Date().toISOString(),
    });

    logActivity(
      user || null,
      'RETURN_STATUS_UPDATED',
      'return_request',
      returnId,
      `Return ${updated.return_number} status updated to ${newStatus}`
    );
  }

  return updated;
};

export const approveReturnRequest = (
  returnId: string,
  adminId: string,
  user?: User
): ReturnRequest | null => {
  const updated = db.update('return_requests', returnId, {
    status: 'approved',
    approved_by_admin_id: adminId,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (updated) {
    logActivity(
      user || null,
      'RETURN_APPROVED',
      'return_request',
      returnId,
      `Return ${updated.return_number} approved by admin`
    );
  }

  return updated;
};

export const rejectReturnRequest = (
  returnId: string,
  adminId: string,
  rejectionReason: string,
  user?: User
): ReturnRequest | null => {
  const updated = db.update('return_requests', returnId, {
    status: 'rejected',
    approved_by_admin_id: adminId,
    approved_at: new Date().toISOString(),
    rejection_reason: rejectionReason,
    updated_at: new Date().toISOString(),
  });

  if (updated) {
    logActivity(
      user || null,
      'RETURN_REJECTED',
      'return_request',
      returnId,
      `Return ${updated.return_number} rejected: ${rejectionReason}`
    );
  }

  return updated;
};

export const assignReturnToAgent = (
  returnId: string,
  agentId: string,
  user?: User
): ReturnRequest | null => {
  const users = db.getTable('users');
  const agent = users.find((u: any) => u.id === agentId && u.role === 'agent');
  
  if (!agent) {
    throw new Error('Agent not found');
  }

  const updated = db.update('return_requests', returnId, {
    assigned_agent_id: agentId,
    assigned_at: new Date().toISOString(),
    status: 'pickup_assigned',
    updated_at: new Date().toISOString(),
  });

  if (updated) {
    logActivity(
      user || null,
      'RETURN_AGENT_ASSIGNED',
      'return_request',
      returnId,
      `Return ${updated.return_number} assigned to agent ${agent.full_name}`
    );
  }

  return updated;
};

export const recordReturnPickup = (
  returnId: string,
  agentId: string,
  proofUrl?: string,
  user?: User
): ReturnRequest | null => {
  const updated = db.update('return_requests', returnId, {
    status: 'picked_up',
    actual_pickup_date: new Date().toISOString(),
    pickup_proof_url: proofUrl,
    updated_at: new Date().toISOString(),
  });

  if (updated) {
    logActivity(
      user || null,
      'RETURN_PICKED_UP',
      'return_request',
      returnId,
      `Return ${updated.return_number} picked up by agent`
    );
  }

  return updated;
};
