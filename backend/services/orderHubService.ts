import { db } from '../database/connection';
import { 
  ExternalOrder, 
  ExternalOrderStatus, 
  ExternalPlatform,
  ExternalOrderTracking,
  OrderHubStats,
  User 
} from '../../shared/types';
import { logActivity } from './activityService';
import { realtimeService } from './realtimeService';

export interface CreateExternalOrderDTO {
  customer_id: string;
  platform: ExternalPlatform;
  platform_order_id: string;
  platform_tracking_number?: string;
  product_name: string;
  product_category?: string;
  product_image_url?: string;
  quantity?: number;
  order_amount?: number;
  currency_code?: string;
  order_date: string;
  expected_delivery_date?: string;
  courier_name?: string;
  delivery_address: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  recipient_name?: string;
  recipient_phone?: string;
  special_instructions?: string;
  notes?: string;
}

export const createExternalOrder = (dto: CreateExternalOrderDTO, user?: User): ExternalOrder => {
  // Check for duplicate order
  const existing = db.getTable('external_orders').find(
    (o: any) => o.platform === dto.platform && o.platform_order_id === dto.platform_order_id
  );

  if (existing) {
    throw new Error('Order already exists in the system');
  }

  const newOrder: ExternalOrder = {
    id: `ext_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    customer_id: dto.customer_id,
    platform: dto.platform,
    platform_order_id: dto.platform_order_id,
    platform_tracking_number: dto.platform_tracking_number,
    product_name: dto.product_name,
    product_category: dto.product_category,
    product_image_url: dto.product_image_url,
    quantity: dto.quantity || 1,
    order_amount: dto.order_amount,
    currency_code: dto.currency_code || 'USD',
    status: 'ordered',
    order_date: dto.order_date,
    expected_delivery_date: dto.expected_delivery_date,
    courier_name: dto.courier_name,
    delivery_address: dto.delivery_address,
    delivery_city: dto.delivery_city,
    delivery_postal_code: dto.delivery_postal_code,
    recipient_name: dto.recipient_name,
    recipient_phone: dto.recipient_phone,
    special_instructions: dto.special_instructions,
    is_imported: dto.platform === 'manual',
    notes: dto.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.insert('external_orders', newOrder);

  // Create initial tracking event
  const initialTracking: ExternalOrderTracking = {
    id: `ext_trk_${Date.now()}`,
    external_order_id: newOrder.id,
    status: 'ordered',
    location: 'Order Placed',
    description: `Order placed on ${dto.platform.toUpperCase()}. Awaiting shipment.`,
    event_timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  db.insert('external_order_tracking', initialTracking);

  logActivity(
    user || null,
    'EXTERNAL_ORDER_ADDED',
    'external_order',
    newOrder.id,
    `External order ${newOrder.platform_order_id} from ${newOrder.platform} added manually`
  );

  return newOrder;
};

export const getExternalOrders = (filters: {
  customerId: string;
  status?: string;
  platform?: string;
  search?: string;
}): ExternalOrder[] => {
  let orders = db.getTable('external_orders').filter(
    (o: any) => o.customer_id === filters.customerId
  );

  if (filters.status && filters.status !== 'all') {
    orders = orders.filter((o: any) => o.status === filters.status);
  }

  if (filters.platform && filters.platform !== 'all') {
    orders = orders.filter((o: any) => o.platform === filters.platform);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    orders = orders.filter((o: any) =>
      o.platform_order_id.toLowerCase().includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      (o.platform_tracking_number && o.platform_tracking_number.toLowerCase().includes(q)) ||
      (o.courier_name && o.courier_name.toLowerCase().includes(q))
    );
  }

  return [...orders].sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const getExternalOrderById = (
  orderId: string
): { order: ExternalOrder; tracking: ExternalOrderTracking[] } | null => {
  const order = db.getTable('external_orders').find((o: any) => o.id === orderId);
  if (!order) return null;

  const tracking = db.getTable('external_order_tracking')
    .filter((t: any) => t.external_order_id === orderId)
    .sort((a: any, b: any) => 
      new Date(a.event_timestamp).getTime() - new Date(b.event_timestamp).getTime()
    );

  return { order, tracking };
};

export const updateExternalOrderStatus = (
  orderId: string,
  newStatus: ExternalOrderStatus,
  location: string,
  description: string,
  user?: User
): ExternalOrder | null => {
  const updated = db.update('external_orders', orderId, {
    status: newStatus,
    current_location: location,
    last_tracking_update: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (!updated) return null;

  // Add tracking event
  const trackingEvent: ExternalOrderTracking = {
    id: `ext_trk_${Date.now()}`,
    external_order_id: orderId,
    status: newStatus,
    location: location || 'Transit Hub',
    description: description || `Status updated to ${newStatus.replace('_', ' ')}`,
    event_timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  db.insert('external_order_tracking', trackingEvent);

  // Send real-time update to customer
  realtimeService.notifyCustomer(updated.customer_id, 'order_status_update', {
    order: updated,
    tracking: trackingEvent,
    timestamp: new Date().toISOString(),
  });

  logActivity(
    user || null,
    'EXTERNAL_ORDER_STATUS_UPDATED',
    'external_order',
    orderId,
    `External order ${updated.platform_order_id} status updated to ${newStatus}`
  );

  return updated;
};

export const deleteExternalOrder = (orderId: string, customerId: string, user?: User): boolean => {
  const order = db.getTable('external_orders').find(
    (o: any) => o.id === orderId && o.customer_id === customerId
  );
  
  if (!order) return false;

  const deleted = db.delete('external_orders', orderId);

  if (deleted) {
    logActivity(
      user || null,
      'EXTERNAL_ORDER_DELETED',
      'external_order',
      orderId,
      `External order ${order.platform_order_id} from ${order.platform} deleted`
    );
  }

  return deleted;
};

export const importOrderByTrackingNumber = async (
  customerId: string,
  trackingNumber: string,
  courier: string,
  user?: User
): Promise<ExternalOrder> => {
  // Check if tracking number already exists
  const existing = db.getTable('external_orders').find(
    (o: any) => o.platform_tracking_number === trackingNumber
  );

  if (existing) {
    throw new Error('Tracking number already exists in the system');
  }

  // Create a placeholder order with tracking number
  const order: ExternalOrder = {
    id: `ext_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    customer_id: customerId,
    platform: 'manual',
    platform_order_id: `MAN-${Date.now()}`,
    platform_tracking_number: trackingNumber,
    product_name: 'Imported Shipment',
    quantity: 1,
    currency_code: 'USD',
    status: 'in_transit',
    order_date: new Date().toISOString(),
    courier_name: courier,
    delivery_address: 'Address to be updated',
    is_imported: true,
    notes: 'Imported via tracking number',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.insert('external_orders', order);

  const initialTracking: ExternalOrderTracking = {
    id: `ext_trk_${Date.now()}`,
    external_order_id: order.id,
    status: 'in_transit',
    location: 'Tracking Number Imported',
    description: `Shipment imported with tracking number ${trackingNumber}. Courier: ${courier}`,
    event_timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  db.insert('external_order_tracking', initialTracking);

  logActivity(
    user || null,
    'TRACKING_NUMBER_IMPORTED',
    'external_order',
    order.id,
    `Tracking number ${trackingNumber} imported for ${courier}`
  );

  return order;
};

export const getOrderHubStats = (customerId: string): OrderHubStats => {
  const parcels = db.getTable('parcels').filter((p: any) => p.sender_id === customerId);
  const externalOrders = db.getTable('external_orders').filter((o: any) => o.customer_id === customerId);
  const returns = db.getTable('return_requests').filter((r: any) => r.customer_id === customerId);

  const allOrders = [...parcels, ...externalOrders];

  return {
    total_orders: allOrders.length,
    in_transit: allOrders.filter((o: any) => 
      ['in_transit', 'picked_up'].includes(o.status)
    ).length,
    out_for_delivery: allOrders.filter((o: any) => 
      o.status === 'out_for_delivery'
    ).length,
    delivered: allOrders.filter((o: any) => 
      o.status === 'delivered'
    ).length,
    returns: returns.filter((r: any) => 
      !['completed', 'cancelled'].includes(r.status)
    ).length,
    attention_required: allOrders.filter((o: any) => 
      ['failed', 'delayed', 'cancelled'].includes(o.status)
    ).length + returns.filter((r: any) => r.status === 'requested').length,
  };
};

export const getAllCustomerOrders = (filters: {
  customerId: string;
  status?: string;
  platform?: string;
  search?: string;
  sortBy?: 'date' | 'platform' | 'status';
  sortOrder?: 'asc' | 'desc';
}) => {
  // Get both SwiftRoute parcels and external orders
  const parcels = db.getTable('parcels')
    .filter((p: any) => p.sender_id === filters.customerId)
    .map((p: any) => ({
      ...p,
      order_type: 'swiftroute',
      platform: 'swiftroute' as ExternalPlatform,
      platform_order_id: p.tracking_number,
      product_name: `Parcel to ${p.recipient_name}`,
      order_date: p.created_at,
    }));

  let externalOrders = db.getTable('external_orders')
    .filter((o: any) => o.customer_id === filters.customerId)
    .map((o: any) => ({
      ...o,
      order_type: 'external',
    }));

  let allOrders = [...parcels, ...externalOrders];

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    allOrders = allOrders.filter((o: any) => o.status === filters.status);
  }

  if (filters.platform && filters.platform !== 'all') {
    allOrders = allOrders.filter((o: any) => o.platform === filters.platform);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    allOrders = allOrders.filter((o: any) =>
      (o.platform_order_id && o.platform_order_id.toLowerCase().includes(q)) ||
      (o.tracking_number && o.tracking_number.toLowerCase().includes(q)) ||
      (o.product_name && o.product_name.toLowerCase().includes(q)) ||
      (o.recipient_name && o.recipient_name.toLowerCase().includes(q))
    );
  }

  // Apply sorting
  const sortField = filters.sortBy || 'date';
  const sortOrder = filters.sortOrder || 'desc';

  allOrders.sort((a: any, b: any) => {
    let compareA, compareB;

    if (sortField === 'date') {
      compareA = new Date(a.order_date || a.created_at).getTime();
      compareB = new Date(b.order_date || b.created_at).getTime();
    } else if (sortField === 'platform') {
      compareA = a.platform;
      compareB = b.platform;
    } else if (sortField === 'status') {
      compareA = a.status;
      compareB = b.status;
    }

    if (sortOrder === 'asc') {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });

  return allOrders;
};
