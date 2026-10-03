import { db } from '../database/connection';
import { Payment, PaymentMethod, User, Parcel } from '../../shared/types';
import { logActivity } from './activityService';

export const processPayment = (
  parcelId: string,
  userId: string,
  paymentMethod: PaymentMethod,
  user: User
): { payment: Payment; parcel: Parcel } => {
  const parcel = db.getTable('parcels').find((p) => p.id === parcelId);
  if (!parcel) {
    throw new Error('Parcel not found');
  }

  if (parcel.payment_status === 'paid') {
    throw new Error('This shipment has already been paid in full');
  }

  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const payment: Payment = {
    id: `pay_${Date.now()}`,
    parcel_id: parcelId,
    user_id: userId,
    amount: parcel.shipping_cost,
    payment_method: paymentMethod,
    transaction_id: transactionId,
    status: 'completed',
    created_at: new Date().toISOString(),
  };

  db.insert('payments', payment);

  const updatedParcel = db.update('parcels', parcelId, {
    payment_status: 'paid',
  });

  logActivity(
    user,
    'PAYMENT_RECEIVED',
    'payment',
    payment.id,
    `Payment of $${payment.amount} received via ${paymentMethod} for parcel ${parcel.tracking_number} (Ref: ${transactionId})`
  );

  return { payment, parcel: updatedParcel };
};

export const getPaymentsForUser = (userId: string, role: string): Payment[] => {
  const payments = db.getTable('payments');
  if (role === 'admin') {
    return [...payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  return payments
    .filter((p) => p.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getInvoiceData = (parcelId: string) => {
  const parcel = db.getTable('parcels').find((p) => p.id === parcelId);
  if (!parcel) return null;

  const payment = db.getTable('payments').find((p) => p.parcel_id === parcelId);
  const sender = db.getTable('users').find((u) => u.id === parcel.sender_id);
  const settings = db.getTable('system_settings');

  const baseCost = Math.round(parcel.weight_kg * settings.base_rate_per_kg * 100) / 100;
  const surcharge = Math.round((parcel.shipping_cost - baseCost) * 100) / 100;
  const tax = Math.round(parcel.shipping_cost * (settings.tax_rate_percent / 100) * 100) / 100;
  const grandTotal = Math.round((parcel.shipping_cost + tax) * 100) / 100;

  return {
    invoiceNumber: `INV-${parcel.tracking_number}`,
    invoiceDate: parcel.created_at,
    dueDate: parcel.created_at,
    company: {
      name: settings.company_name,
      email: settings.support_email,
      phone: settings.support_phone,
      address: 'One Maritime Plaza, Suite 2400, San Francisco, CA 94111',
      taxId: 'US-EIN-88-2910481',
    },
    sender: {
      name: parcel.sender_name || sender?.full_name || 'Customer',
      email: sender?.email || 'N/A',
      phone: sender?.phone || 'N/A',
      address: parcel.pickup_address,
    },
    recipient: {
      name: parcel.recipient_name,
      phone: parcel.recipient_phone,
      email: parcel.recipient_email || 'N/A',
      address: parcel.delivery_address,
    },
    parcelDetails: {
      trackingNumber: parcel.tracking_number,
      type: parcel.parcel_type,
      weight: `${parcel.weight_kg} kg`,
      dimensions: parcel.dimensions,
      status: parcel.status,
    },
    charges: [
      { description: `Standard freight base charge (${parcel.weight_kg} kg @ $${settings.base_rate_per_kg}/kg)`, amount: baseCost },
      { description: `Service handling & speed tier (${parcel.parcel_type})`, amount: Math.max(0, surcharge) },
      { description: `Applicable state logistics tax (${settings.tax_rate_percent}%)`, amount: tax },
    ],
    subtotal: parcel.shipping_cost,
    tax,
    total: grandTotal,
    paymentStatus: parcel.payment_status,
    transactionId: payment?.transaction_id || 'PENDING-SETTLEMENT',
    paymentMethod: payment?.payment_method || 'PENDING',
  };
};
