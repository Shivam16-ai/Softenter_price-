import { db } from '../database/connection';
import { Parcel, ParcelStatus, ParcelType, TrackingCheckpoint, DeliveryProof, User } from '../../shared/types';
import { generateTrackingNumber, calculateShippingCost } from '../utils/trackingGenerator';
import { logActivity } from './activityService';
import { realtimeService } from './realtimeService';

export interface CreateParcelDTO {
  sender_id: string;
  sender_name?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  pickup_address: string;
  delivery_address: string;
  weight_kg: number;
  dimensions?: string;
  parcel_type: ParcelType;
  special_instructions?: string;
}

export const createParcel = (dto: CreateParcelDTO, creatorUser?: User): Parcel => {
  const trackingNumber = generateTrackingNumber();
  const settings = db.getTable('system_settings');
  const cost = calculateShippingCost(
    dto.weight_kg,
    dto.parcel_type,
    settings.base_rate_per_kg,
    settings.express_surcharge,
    settings.fragile_surcharge
  );

  // Calculate estimated delivery
  const hoursToAdd = dto.parcel_type === 'express' ? 24 : 72;
  const estimatedDelivery = new Date(Date.now() + hoursToAdd * 3600000).toISOString();

  const newParcel: Parcel = {
    id: `pcl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tracking_number: trackingNumber,
    sender_id: dto.sender_id,
    sender_name: dto.sender_name || creatorUser?.full_name || 'Valued Customer',
    recipient_name: dto.recipient_name,
    recipient_phone: dto.recipient_phone,
    recipient_email: dto.recipient_email,
    pickup_address: dto.pickup_address,
    delivery_address: dto.delivery_address,
    weight_kg: Number(dto.weight_kg),
    dimensions: dto.dimensions || 'Standard',
    parcel_type: dto.parcel_type,
    status: 'pending',
    assigned_agent_id: null,
    assigned_agent_name: null,
    shipping_cost: cost,
    payment_status: 'unpaid',
    estimated_delivery: estimatedDelivery,
    special_instructions: dto.special_instructions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.insert('parcels', newParcel);

  // Initial checkpoint
  const initialCheckpoint: TrackingCheckpoint = {
    id: `trk_${Date.now()}`,
    parcel_id: newParcel.id,
    tracking_number: newParcel.tracking_number,
    status: 'pending',
    location: dto.pickup_address.split(',')[0] || 'Origin Facility',
    description: 'Shipment booking registered in SwiftRoute system. Awaiting courier pickup.',
    timestamp: new Date().toISOString(),
    updated_by: creatorUser?.full_name || 'System Dispatch',
  };
  db.insert('parcel_tracking', initialCheckpoint);

  logActivity(
    creatorUser || null,
    'PARCEL_BOOKED',
    'parcel',
    newParcel.id,
    `New parcel ${newParcel.tracking_number} booked for ${newParcel.recipient_name} (${newParcel.weight_kg}kg, $${newParcel.shipping_cost})`
  );

  return newParcel;
};

export const getParcels = (filters: {
  userId?: string;
  role?: string;
  agentId?: string;
  status?: string;
  search?: string;
}): Parcel[] => {
  let parcels = db.getTable('parcels');

  if (filters.userId && filters.role === 'customer') {
    parcels = parcels.filter((p) => p.sender_id === filters.userId);
  } else if (filters.agentId && filters.role === 'agent') {
    parcels = parcels.filter((p) => p.assigned_agent_id === filters.agentId);
  }

  if (filters.status && filters.status !== 'all') {
    parcels = parcels.filter((p) => p.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    parcels = parcels.filter((p) => 
      p.tracking_number.toLowerCase().includes(q) ||
      p.recipient_name.toLowerCase().includes(q) ||
      p.delivery_address.toLowerCase().includes(q) ||
      (p.sender_name && p.sender_name.toLowerCase().includes(q))
    );
  }

  return [...parcels].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getParcelById = (id: string): { parcel: Parcel; tracking: TrackingCheckpoint[]; proof?: DeliveryProof } | null => {
  const parcels = db.getTable('parcels');
  const parcel = parcels.find((p) => p.id === id);
  if (!parcel) return null;

  const tracking = db.getTable('parcel_tracking')
    .filter((t) => t.parcel_id === id || t.tracking_number === parcel.tracking_number)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const proof = db.getTable('delivery_proofs').find((pr) => pr.parcel_id === id);

  return { parcel, tracking, proof };
};

export const getParcelByTrackingNumber = (trackingNumber: string) => {
  const parcels = db.getTable('parcels');
  const cleanNumber = trackingNumber.trim().toUpperCase();
  const parcel = parcels.find((p) => p.tracking_number.toUpperCase() === cleanNumber);
  if (!parcel) return null;

  const tracking = db.getTable('parcel_tracking')
    .filter((t) => t.parcel_id === parcel.id || t.tracking_number.toUpperCase() === cleanNumber)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const proof = db.getTable('delivery_proofs').find((pr) => pr.parcel_id === parcel.id);

  return { parcel, tracking, proof };
};

export const assignAgent = (parcelId: string, agentId: string, adminUser?: User): Parcel | null => {
  const users = db.getTable('users');
  const agent = users.find((u) => u.id === agentId && u.role === 'agent');
  if (!agent) {
    throw new Error('Designated courier agent not found');
  }

  const updated = db.update('parcels', parcelId, {
    assigned_agent_id: agent.id,
    assigned_agent_name: agent.full_name,
    status: 'assigned',
  });

  if (updated) {
    const checkpoint: TrackingCheckpoint = {
      id: `trk_${Date.now()}`,
      parcel_id: updated.id,
      tracking_number: updated.tracking_number,
      status: 'assigned',
      location: 'Regional Sorting Facility',
      description: `Dispatched to courier agent ${agent.full_name}. Preparing for pickup.`,
      timestamp: new Date().toISOString(),
      updated_by: adminUser?.full_name || 'Dispatch Center',
    };
    db.insert('parcel_tracking', checkpoint);

    logActivity(
      adminUser || null,
      'AGENT_ASSIGNED',
      'parcel',
      updated.id,
      `Assigned parcel ${updated.tracking_number} to agent ${agent.full_name}`
    );
  }

  return updated;
};

export const updateParcelStatus = (
  parcelId: string,
  newStatus: ParcelStatus,
  location: string,
  description: string,
  actor: User
): Parcel | null => {
  const updated = db.update('parcels', parcelId, { status: newStatus });
  if (!updated) return null;

  const checkpoint: TrackingCheckpoint = {
    id: `trk_${Date.now()}`,
    parcel_id: updated.id,
    tracking_number: updated.tracking_number,
    status: newStatus,
    location: location || 'Transit Node',
    description: description || `Status updated to ${newStatus.replace('_', ' ')}`,
    timestamp: new Date().toISOString(),
    updated_by: actor.full_name,
  };
  db.insert('parcel_tracking', checkpoint);

  // Send real-time update to customer
  if (updated.sender_id) {
    realtimeService.notifyCustomer(updated.sender_id, 'parcel_status_update', {
      parcel: updated,
      checkpoint,
      timestamp: new Date().toISOString(),
    });
  }

  logActivity(
    actor,
    'STATUS_UPDATED',
    'parcel',
    updated.id,
    `Updated status of ${updated.tracking_number} to ${newStatus} at ${location}`
  );

  return updated;
};

export const recordDeliveryProof = (
  parcelId: string,
  agent: User,
  proofData: {
    recipient_name: string;
    signature_url?: string;
    photo_url?: string;
    notes?: string;
  }
): DeliveryProof => {
  const parcel = db.getTable('parcels').find((p) => p.id === parcelId);
  if (!parcel) throw new Error('Parcel not found');

  const proof: DeliveryProof = {
    id: `prf_${Date.now()}`,
    parcel_id: parcelId,
    agent_id: agent.id,
    recipient_name: proofData.recipient_name || parcel.recipient_name,
    signature_url: proofData.signature_url,
    photo_url: proofData.photo_url,
    notes: proofData.notes,
    delivered_at: new Date().toISOString(),
  };

  db.insert('delivery_proofs', proof);

  // Update parcel status
  db.update('parcels', parcelId, {
    status: 'delivered',
  });

  const checkpoint: TrackingCheckpoint = {
    id: `trk_${Date.now()}`,
    parcel_id: parcel.id,
    tracking_number: parcel.tracking_number,
    status: 'delivered',
    location: parcel.delivery_address,
    description: `Package successfully delivered and handed over to ${proof.recipient_name}. Proof of delivery recorded.`,
    timestamp: new Date().toISOString(),
    updated_by: agent.full_name,
  };
  db.insert('parcel_tracking', checkpoint);

  logActivity(
    agent,
    'DELIVERY_CONFIRMED',
    'parcel',
    parcel.id,
    `Delivered parcel ${parcel.tracking_number} to ${proof.recipient_name}`
  );

  return proof;
};
